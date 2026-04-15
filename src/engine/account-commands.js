// ══════════════════════════════════════════════════════════════════════════════
// Account Management — Chat Commands
//
// Installs the `/profile`, `/security`, and `/save` command families via the
// central command registry WITHOUT touching src/commands/all.js or src/server.js.
//
// Usage from the server bootstrap:
//
//   const accountCommands = require('./engine/account-commands');
//   accountCommands.register({
//     commands,          // src/engine/commands.js
//     account,           // src/engine/account.js
//     security,          // src/engine/account-security.js
//     saveStates,        // src/engine/save-states.js
//   });
//
// Commands installed:
//
//   /profile                        show profile card
//   /profile edit bio <text>
//   /profile edit title <name>
//   /profile edit status <online|away|invisible|dnd>
//   /profile edit visibility <public|friends|private>
//   /profile edit name <newName>    subject to cooldown
//   /profile privacy                show current privacy
//   /profile privacy <key> <value>  set a single privacy field
//
//   /security status
//   /security password <new>        set or change password
//   /security 2fa setup             returns secret + otpauth URI
//   /security 2fa verify <code>     confirms 2FA enrolment
//   /security 2fa disable
//   /security bankpin set <pin>
//   /security bankpin enter <pin>   unlock PIN session for 10 min
//   /security bankpin change <old> <new>
//   /security bankpin remove        request removal (3-day delay)
//   /security bankpin finalize      finalize removal after delay
//   /security recovery <email>      set recovery email
//
//   /save list
//   /save create <label>
//   /save restore <id>              requires confirmation twice
//   /save confirm restore <id>      second confirmation
//   /save delete <id>
//   /save export                    returns JSON to stdout (save to a file)
//   /save import <json>             requires confirm twice
//   /save autosnap                  manually trigger auto snapshot
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

// Pending-confirmation cache for destructive save ops.
// Keyed by playerId → { action, target, expiresAt }
const pendingConfirm = new Map();
const CONFIRM_TTL_MS = 60 * 1000;

function _setPending(playerId, action, target) {
  pendingConfirm.set(playerId, { action, target, expiresAt: Date.now() + CONFIRM_TTL_MS });
}

function _takePending(playerId, action, target) {
  const entry = pendingConfirm.get(playerId);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) { pendingConfirm.delete(playerId); return false; }
  if (entry.action !== action) return false;
  if (target && entry.target !== target) return false;
  pendingConfirm.delete(playerId);
  return true;
}

function register(opts) {
  const commands   = opts && opts.commands;
  const account    = opts && opts.account;
  const security   = opts && opts.security;
  const saveStates = opts && opts.saveStates;
  if (!commands)   throw new Error('account-commands.register: commands module required');
  if (!account)    throw new Error('account-commands.register: account module required');
  if (!security)   throw new Error('account-commands.register: security module required');
  if (!saveStates) throw new Error('account-commands.register: saveStates module required');

  // ── /profile ────────────────────────────────────────────────────────────
  commands.register('profile', {
    help: 'View or edit your profile: profile, profile edit <field> <val>, profile privacy',
    category: 'Account',
    aliases: ['me'],
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      if (!sub || sub === 'show' || sub === 'view') {
        const pr = account.getProfile(p);
        if (!pr) return 'No profile.';
        const modes = (pr.modes || []).join(', ') || 'normal';
        const titles = (pr.titles && pr.titles.length) ? pr.titles.join(', ') : '(none)';
        const lines = [
          '── Profile ──',
          `  Name:         ${pr.name}`,
          `  ID:           ${pr.id}`,
          `  Total level:  ${pr.totalLevel}`,
          `  Modes:        ${modes}`,
          `  Status:       ${pr.onlineStatus}`,
          `  Visibility:   ${pr.visibility}`,
          `  Title:        ${pr.title || '(none)'}`,
          `  Titles owned: ${titles}`,
          `  Bonds active: ${pr.bondsActive}`,
          `  Created:      ${new Date(pr.createdAt).toISOString().slice(0, 10)}`,
          `  Bio:          ${pr.bio || '(blank)'}`,
        ];
        if (pr.nameHistory && pr.nameHistory.length) {
          lines.push('  Previous names: ' + pr.nameHistory.map(h => h.name).join(', '));
        }
        return lines.join('\n');
      }

      if (sub === 'edit') {
        const field = (args[1] || '').toLowerCase();
        const value = args.slice(2).join(' ');
        if (!field) return 'Usage: profile edit <bio|title|status|visibility|name> <value>';
        const patch = {};
        switch (field) {
          case 'bio':         patch.bio = value; break;
          case 'title':       patch.title = value; break;
          case 'avatar':      patch.avatar = value; break;
          case 'status':      patch.onlineStatus = value; break;
          case 'visibility':  patch.visibility = value; break;
          case 'name':
          case 'displayname': patch.displayName = value; break;
          default: return `Unknown profile field: ${field}`;
        }
        const res = account.updateProfile(p, patch);
        if (!res.ok) return `Error: ${res.reason}`;
        return `Updated: ${JSON.stringify(res.applied)}`;
      }

      if (sub === 'privacy') {
        const key = (args[1] || '').toLowerCase();
        const val = args.slice(2).join(' ');
        if (!key) {
          const cur = account.getPrivacy(p);
          const lines = ['── Privacy ──'];
          for (const k of Object.keys(cur)) lines.push(`  ${k}: ${cur[k]}`);
          return lines.join('\n');
        }
        let parsed = val;
        if (val === 'true') parsed = true;
        else if (val === 'false') parsed = false;
        const res = account.setPrivacy(p, { [key]: parsed });
        if (!res.ok) return `Error: ${res.reason}`;
        return `Privacy updated: ${JSON.stringify(res.applied)}`;
      }

      return 'Usage: profile | profile edit <field> <value> | profile privacy [<key> <value>]';
    },
  });

  // ── /security ───────────────────────────────────────────────────────────
  commands.register('security', {
    help: 'Account security: security status, password, 2fa setup/verify, bankpin set/enter',
    category: 'Account',
    aliases: ['sec'],
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      if (!sub || sub === 'status') {
        const s = security.ensureSecurity(p);
        const lines = [
          '── Security status ──',
          `  Password:      ${s.passwordHash ? 'set' : '(not set)'}`,
          `  2FA (TOTP):    ${s.totpEnabled ? 'enabled' : (s.totpSecret ? 'pending verification' : 'disabled')}`,
          `  Bank PIN:      ${s.bankPinHash ? 'set' : '(not set)'}`,
          `  PIN unlocked:  ${security.isBankPinVerified(p) ? 'yes' : 'no'}`,
          `  PIN locked:    ${s.pinLocked ? 'YES (too many failures)' : 'no'}`,
          `  Recovery:      ${s.recoveryEmail ? s.recoveryEmail : '(not set)'}`,
        ];
        if (s.bankPinRemoveRequestedAt) {
          lines.push(`  PIN removal in progress (requested ${new Date(s.bankPinRemoveRequestedAt).toISOString()})`);
        }
        return lines.join('\n');
      }

      if (sub === 'password') {
        const pw = args.slice(1).join(' ');
        if (!pw) return 'Usage: security password <newPassword>';
        const res = security.setPassword(p, pw);
        if (!res.ok) return `Error: ${res.reason}`;
        return 'Password set.';
      }

      if (sub === '2fa') {
        const op = (args[1] || '').toLowerCase();
        if (op === 'setup' || op === 'enable') {
          const res = security.enable2FA(p, 'totp');
          if (!res.ok) return `Error: ${res.reason}`;
          return [
            '── 2FA setup ──',
            '  Add this secret to your authenticator app:',
            `    secret: ${res.secret}`,
            `  Or scan the otpauth URI:`,
            `    ${res.qr}`,
            '  Then run: security 2fa verify <code>',
          ].join('\n');
        }
        if (op === 'verify') {
          const code = args[2];
          if (!code) return 'Usage: security 2fa verify <code>';
          const res = security.verify2FA(p, code);
          if (!res.ok) return `Error: ${res.reason}`;
          return '2FA verified and enabled.';
        }
        if (op === 'disable' || op === 'off') {
          const res = security.disable2FA(p);
          if (!res.ok) return `Error: ${res.reason}`;
          return '2FA disabled.';
        }
        return 'Usage: security 2fa setup | verify <code> | disable';
      }

      if (sub === 'bankpin' || sub === 'pin') {
        const op = (args[1] || '').toLowerCase();
        if (op === 'set') {
          const pin = args[2];
          if (!pin) return 'Usage: security bankpin set <4-6 digits>';
          const res = security.setBankPin(p, pin);
          if (!res.ok) return `Error: ${res.reason}`;
          return 'Bank PIN set.';
        }
        if (op === 'enter' || op === 'unlock' || op === 'verify') {
          const pin = args[2];
          if (!pin) return 'Usage: security bankpin enter <pin>';
          const res = security.verifyBankPin(p, pin);
          if (!res.ok) return `Error: ${res.reason}`;
          return 'Bank PIN verified. You have 10 minutes of bank access.';
        }
        if (op === 'change') {
          const oldPin = args[2];
          const newPin = args[3];
          if (!oldPin || !newPin) return 'Usage: security bankpin change <old> <new>';
          const v = security.verifyBankPin(p, oldPin);
          if (!v.ok) return `Error: ${v.reason}`;
          const r = security.setBankPin(p, newPin);
          if (!r.ok) return `Error: ${r.reason}`;
          return 'Bank PIN changed.';
        }
        if (op === 'remove') {
          const res = security.requestRemoveBankPin(p);
          if (!res.ok) return `Error: ${res.reason}`;
          return `PIN removal requested. Complete with "security bankpin finalize" after ${new Date(res.completesAt).toISOString()}.`;
        }
        if (op === 'finalize') {
          const res = security.finalizeRemoveBankPin(p);
          if (!res.ok) return `Error: ${res.reason}`;
          return 'Bank PIN removed.';
        }
        return 'Usage: security bankpin set|enter|change|remove|finalize';
      }

      if (sub === 'recovery' || sub === 'email') {
        const email = args[1];
        const res = security.recoveryEmail(p, email);
        if (!res.ok) return `Error: ${res.reason}`;
        return email === undefined
          ? `Recovery email: ${res.email || '(not set)'}`
          : `Recovery email set to ${res.email || '(cleared)'}.`;
      }

      return 'Usage: security status | password <pw> | 2fa <op> | bankpin <op> | recovery <email>';
    },
  });

  // ── /save ───────────────────────────────────────────────────────────────
  commands.register('save', {
    help: 'Save states: save list | save create <label> | save restore <id> (2x)',
    category: 'Account',
    aliases: ['snapshot'],
    fn: (p, args) => {
      const sub = (args[0] || '').toLowerCase();

      if (!sub || sub === 'list') {
        const list = saveStates.listSnapshots(p);
        if (!list.length) return '(no snapshots)';
        const lines = ['── Snapshots ──'];
        for (const s of list.slice(0, 40)) {
          const ts = new Date(s.createdAt).toISOString().slice(0, 19).replace('T', ' ');
          lines.push(`  ${s.snapshotId}   ${s.kind.padEnd(7)}  ${ts}  ${(s.size / 1024).toFixed(1)}kb`);
        }
        if (list.length > 40) lines.push(`  ... and ${list.length - 40} more`);
        return lines.join('\n');
      }

      if (sub === 'create' || sub === 'new') {
        const label = args.slice(1).join('-').replace(/[^a-zA-Z0-9_\-]/g, '-') || 'manual';
        const res = saveStates.createSnapshot(p, label);
        if (!res.ok) return `Error: ${res.reason}`;
        return `Snapshot created: ${res.snapshotId}`;
      }

      if (sub === 'restore') {
        const id = args[1];
        if (!id) return 'Usage: save restore <snapshotId>';
        if (!_takePending(p.id, 'restore', id)) {
          _setPending(p.id, 'restore', id);
          return [
            'WARNING: Restore is DESTRUCTIVE. Your current state will be replaced.',
            `Re-run "save restore ${id}" within 60 seconds to confirm, or "save confirm restore ${id}".`,
            '(A pre-restore undo snapshot will be created automatically.)',
          ].join('\n');
        }
        const res = saveStates.restoreSnapshot(p, id, { confirm: true });
        if (!res.ok) return `Error: ${res.reason}`;
        return `Restored snapshot ${id}. Undo available: ${res.undoSnapshotId || '(none)'}.`;
      }

      if (sub === 'confirm') {
        const what = (args[1] || '').toLowerCase();
        const id = args[2];
        if (what === 'restore') {
          if (!id) return 'Usage: save confirm restore <snapshotId>';
          if (!_takePending(p.id, 'restore', id)) return 'No pending restore to confirm.';
          const res = saveStates.restoreSnapshot(p, id, { confirm: true });
          if (!res.ok) return `Error: ${res.reason}`;
          return `Restored snapshot ${id}. Undo available: ${res.undoSnapshotId || '(none)'}.`;
        }
        if (what === 'import') {
          if (!_takePending(p.id, 'import', 'pending')) return 'No pending import to confirm.';
          const json = args.slice(2).join(' ');
          if (!json) return 'Usage: save confirm import <json>';
          const res = saveStates.importSave(p, json, { confirm: true });
          if (!res.ok) return `Error: ${res.reason}`;
          return `Imported save (${res.restoredFields} fields). Undo: ${res.undoSnapshotId || '(none)'}.`;
        }
        return 'Usage: save confirm restore <id> | save confirm import <json>';
      }

      if (sub === 'delete' || sub === 'rm') {
        const id = args[1];
        if (!id) return 'Usage: save delete <snapshotId>';
        const res = saveStates.deleteSnapshot(p, id);
        if (!res.ok) return `Error: ${res.reason}`;
        return `Deleted ${id}.`;
      }

      if (sub === 'export') {
        const json = saveStates.exportSave(p);
        return json;
      }

      if (sub === 'import') {
        const json = args.slice(1).join(' ');
        if (!json) return 'Usage: save import <json>';
        if (!_takePending(p.id, 'import', 'pending')) {
          _setPending(p.id, 'import', 'pending');
          return [
            'WARNING: Import is DESTRUCTIVE. Your current state will be replaced.',
            'Re-run "save import <json>" within 60 seconds to confirm, or use "save confirm import <json>".',
          ].join('\n');
        }
        const res = saveStates.importSave(p, json, { confirm: true });
        if (!res.ok) return `Error: ${res.reason}`;
        return `Imported save (${res.restoredFields} fields). Undo: ${res.undoSnapshotId || '(none)'}.`;
      }

      if (sub === 'autosnap' || sub === 'auto') {
        const res = saveStates.autoSnapshot(p);
        if (!res.ok) return res.skipped
          ? `Skipped: ${res.reason}`
          : `Error: ${res.reason}`;
        return `Auto snapshot: ${res.snapshotId}`;
      }

      return 'Usage: save list | create <label> | restore <id> | delete <id> | export | import <json>';
    },
  });
}

module.exports = { register };
