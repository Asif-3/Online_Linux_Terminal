import { VirtualFileSystem } from './fileSystem';

const fs = new VirtualFileSystem();
let cwd = '/home/asif';
let history = [];
let aliases = { ll: 'ls -la', la: 'ls -a', '..': 'cd ..', cls: 'clear' };
let envVars = { HOME: '/home/asif', USER: 'asif', SHELL: '/bin/bash', PATH: '/usr/local/bin:/usr/bin:/bin', TERM: 'xterm-256color', LANG: 'en_US.UTF-8', HOSTNAME: 'asif-linux', PWD: '/home/asif', EDITOR: 'nano' };
let sudoMode = false;

export function getCwd() { return cwd; }
export function getHistory() { return [...history]; }
export function getPrompt() {
    const display = cwd.replace('/home/asif', '~') || '/';
    return { user: envVars.USER, host: envVars.HOSTNAME, path: display };
}

export function getCurrentUser() {
    return envVars.USER;
}

export function verifyPassword(input) {
    return input === '3333';
}

export function loginAs(user) {
    envVars.USER = user;
    if (user === 'root') {
        envVars.HOME = '/root';
        cwd = '/root';
        aliases['ls'] = 'ls -la'; // root usually has ll too
        envVars.PS1 = 'root@asif-linux:\\w# ';
    } else {
        envVars.HOME = '/home/asif';
        cwd = '/home/asif';
        delete aliases['ls'];
        envVars.PS1 = 'asif@asif-linux:\\w$ ';
    }
}

export function saveFile(path, content) {
    return fs.writeFile(path, content);
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + '';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'K';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + 'M';
    return (bytes / 1073741824).toFixed(1) + 'G';
}

function parseArgs(argsStr) {
    const args = []; let current = ''; let inQuote = false; let quoteChar = '';
    for (let i = 0; i < argsStr.length; i++) {
        const c = argsStr[i];
        if (inQuote) { if (c === quoteChar) inQuote = false; else current += c; }
        else if (c === '"' || c === "'") { inQuote = true; quoteChar = c; }
        else if (c === ' ') { if (current) args.push(current); current = ''; }
        else current += c;
    }
    if (current) args.push(current);
    return args;
}

function getFlags(args) {
    const flags = new Set(); const params = [];
    args.forEach(a => { if (a.startsWith('-') && a.length > 1) { if (a.startsWith('--')) flags.add(a); else[...a.slice(1)].forEach(f => flags.add('-' + f)); } else params.push(a); });
    return { flags, params };
}

const commands = {
    ls(args) {
        const { flags, params } = getFlags(args);
        const target = params[0] ? fs.resolvePath(params[0], cwd) : cwd;
        const entries = fs.listDir(target);
        if (!entries) return { output: `ls: cannot access '${params[0] || target}': No such file or directory`, type: 'error' };
        let items = entries;
        if (!flags.has('-a')) items = items.filter(e => !e.name.startsWith('.'));
        items.sort((a, b) => a.name.localeCompare(b.name));
        if (flags.has('-l') || flags.has('-la') || flags.has('-al')) {
            const lines = [`total ${items.length}`];
            items.forEach(e => {
                const size = formatSize(e.size || 4096).padStart(6);
                const d = e.mtime ? new Date(e.mtime) : new Date();
                const date = `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
                const name = e.type === 'dir' ? `\x1b[1;34m${e.name}/\x1b[0m` : (e.permissions && e.permissions.includes('x') ? `\x1b[1;32m${e.name}\x1b[0m` : e.name);
                lines.push(`${e.permissions} 1 ${e.owner || 'asif'} ${e.group || 'asif'} ${size} ${date} ${name}`);
            });
            return { output: lines.join('\n'), type: 'output' };
        }
        const names = items.map(e => e.type === 'dir' ? `\x1b[1;34m${e.name}/\x1b[0m` : e.name);
        return { output: names.join('  '), type: 'output' };
    },

    cd(args) {
        const target = args[0] || '~';
        const resolved = fs.resolvePath(target, cwd);
        if (!fs.isDir(resolved)) return { output: `cd: ${target}: No such file or directory`, type: 'error' };
        cwd = resolved;
        envVars.PWD = cwd;
        return { output: '', type: 'output' };
    },

    pwd() { return { output: cwd, type: 'output' }; },

    mkdir(args) {
        if (!args.length) return { output: 'mkdir: missing operand', type: 'error' };
        const { flags, params } = getFlags(args);
        const results = [];
        params.forEach(a => {
            const p = fs.resolvePath(a, cwd);
            if (!fs.createDir(p, flags.has('-p'))) results.push(`mkdir: cannot create directory '${a}': File exists`);
        });
        return { output: results.join('\n'), type: results.length ? 'error' : 'output' };
    },

    rmdir(args) {
        if (!args.length) return { output: 'rmdir: missing operand', type: 'error' };
        const p = fs.resolvePath(args[0], cwd);
        const node = fs.getNode(p);
        if (!node) return { output: `rmdir: '${args[0]}': No such file or directory`, type: 'error' };
        if (node.type !== 'dir') return { output: `rmdir: '${args[0]}': Not a directory`, type: 'error' };
        if (node.children && Object.keys(node.children).length > 0) return { output: `rmdir: '${args[0]}': Directory not empty`, type: 'error' };
        fs.deleteNode(p);
        return { output: '', type: 'output' };
    },

    touch(args) {
        if (!args.length) return { output: 'touch: missing file operand', type: 'error' };
        args.filter(a => !a.startsWith('-')).forEach(a => {
            const p = fs.resolvePath(a, cwd);
            if (!fs.exists(p)) fs.createFile(p, '');
        });
        return { output: '', type: 'output' };
    },

    rm(args) {
        const { flags, params } = getFlags(args);
        if (!params.length) return { output: 'rm: missing operand', type: 'error' };
        const results = [];
        params.forEach(a => {
            const p = fs.resolvePath(a, cwd);
            const node = fs.getNode(p);
            if (!node) { results.push(`rm: cannot remove '${a}': No such file or directory`); return; }
            if (node.type === 'dir' && !flags.has('-r') && !flags.has('-R')) { results.push(`rm: cannot remove '${a}': Is a directory`); return; }
            fs.deleteNode(p);
        });
        return { output: results.join('\n'), type: results.length ? 'error' : 'output' };
    },

    cat(args) {
        if (!args.length) return { output: 'cat: missing file operand', type: 'error' };
        const { flags, params } = getFlags(args);
        const results = [];
        params.forEach(a => {
            const p = fs.resolvePath(a, cwd);
            const content = fs.readFile(p);
            if (content === null) results.push(`cat: ${a}: No such file or directory`);
            else if (flags.has('-n')) {
                const lines = content.split('\n');
                results.push(lines.map((l, i) => `     ${i + 1}\t${l}`).join('\n'));
            } else results.push(content);
        });
        return { output: results.join('\n'), type: results.some(r => r.includes('No such')) ? 'error' : 'output' };
    },

    echo(args) {
        const text = args.join(' ').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        // Handle variable expansion
        const expanded = text.replace(/\$(\w+)/g, (_, v) => envVars[v] || '');
        return { output: expanded, type: 'output' };
    },

    cp(args) {
        const { params } = getFlags(args);
        if (params.length < 2) return { output: 'cp: missing operand', type: 'error' };
        const src = fs.resolvePath(params[0], cwd);
        const dest = fs.resolvePath(params[1], cwd);
        if (!fs.copyNode(src, dest)) return { output: `cp: cannot copy '${params[0]}'`, type: 'error' };
        return { output: '', type: 'output' };
    },

    mv(args) {
        const { params } = getFlags(args);
        if (params.length < 2) return { output: 'mv: missing operand', type: 'error' };
        const src = fs.resolvePath(params[0], cwd);
        const dest = fs.resolvePath(params[1], cwd);
        if (!fs.moveNode(src, dest)) return { output: `mv: cannot move '${params[0]}'`, type: 'error' };
        return { output: '', type: 'output' };
    },

    head(args) {
        const { flags, params } = getFlags(args);
        const n = flags.has('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10;
        if (!params.length) return { output: 'head: missing file operand', type: 'error' };
        const p = fs.resolvePath(params[0], cwd);
        const content = fs.readFile(p);
        if (content === null) return { output: `head: '${params[0]}': No such file`, type: 'error' };
        return { output: content.split('\n').slice(0, n).join('\n'), type: 'output' };
    },

    tail(args) {
        const { flags, params } = getFlags(args);
        const n = flags.has('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10;
        if (!params.length) return { output: 'tail: missing file operand', type: 'error' };
        const p = fs.resolvePath(params[0], cwd);
        const content = fs.readFile(p);
        if (content === null) return { output: `tail: '${params[0]}': No such file`, type: 'error' };
        return { output: content.split('\n').slice(-n).join('\n'), type: 'output' };
    },

    wc(args) {
        const { flags, params } = getFlags(args);
        if (!params.length) return { output: 'wc: missing file operand', type: 'error' };
        const p = fs.resolvePath(params[0], cwd);
        const content = fs.readFile(p);
        if (content === null) return { output: `wc: '${params[0]}': No such file`, type: 'error' };
        const lines = content.split('\n').length;
        const words = content.split(/\s+/).filter(Boolean).length;
        const chars = content.length;
        if (flags.has('-l')) return { output: `${lines} ${params[0]}`, type: 'output' };
        if (flags.has('-w')) return { output: `${words} ${params[0]}`, type: 'output' };
        if (flags.has('-c')) return { output: `${chars} ${params[0]}`, type: 'output' };
        return { output: `  ${lines}   ${words} ${chars} ${params[0]}`, type: 'output' };
    },

    grep(args) {
        const { flags, params } = getFlags(args);
        if (params.length < 2) return { output: 'Usage: grep [OPTIONS] PATTERN FILE', type: 'error' };
        const patternStr = params[0];
        const file = params[1];
        const p = fs.resolvePath(file, cwd);
        const content = fs.readFile(p);
        if (content === null) return { output: `grep: ${file}: No such file or directory`, type: 'error' };

        let flagsStr = ''; // Removed 'g' as test() is stateful with global flag
        if (flags.has('-i')) flagsStr += 'i';

        let regex;
        try {
            regex = new RegExp(patternStr, flagsStr);
        } catch (e) {
            return { output: `grep: invalid pattern`, type: 'error' };
        }

        const showNum = flags.has('-n');
        const invert = flags.has('-v');
        const lines = content.split('\n');
        const matches = [];
        lines.forEach((line, i) => {
            const match = regex.test(line);
            if (invert ? !match : match) {
                matches.push(showNum ? `${i + 1}:${line}` : line);
            }
        });
        return { output: matches.join('\n') || '', type: 'output' };
    },

    find(args) {
        const { params } = getFlags(args);
        const startPath = params[0] ? fs.resolvePath(params[0], cwd) : cwd;
        const nameIdx = args.indexOf('-name');
        const pattern = nameIdx >= 0 ? args[nameIdx + 1] : '*';
        const results = fs.find(startPath, pattern);
        return { output: results.join('\n'), type: 'output' };
    },

    sort(args) {
        const { flags, params } = getFlags(args);
        if (!params.length) return { output: 'sort: missing file operand', type: 'error' };
        const p = fs.resolvePath(params[0], cwd);
        const content = fs.readFile(p);
        if (content === null) return { output: `sort: '${params[0]}': No such file`, type: 'error' };
        let lines = content.split('\n').filter(Boolean);
        if (flags.has('-r')) lines.sort().reverse(); else if (flags.has('-n')) lines.sort((a, b) => parseFloat(a) - parseFloat(b)); else lines.sort();
        return { output: lines.join('\n'), type: 'output' };
    },

    uniq(args) {
        const { params } = getFlags(args);
        if (!params.length) return { output: 'uniq: missing file operand', type: 'error' };
        const p = fs.resolvePath(params[0], cwd);
        const content = fs.readFile(p);
        if (content === null) return { output: `uniq: '${params[0]}': No such file`, type: 'error' };
        const lines = content.split('\n');
        const unique = lines.filter((l, i) => i === 0 || l !== lines[i - 1]);
        return { output: unique.join('\n'), type: 'output' };
    },

    cut(args) {
        const dIdx = args.indexOf('-d'); const fIdx = args.indexOf('-f');
        const delim = dIdx >= 0 ? args[dIdx + 1] : '\t';
        const field = fIdx >= 0 ? parseInt(args[fIdx + 1]) - 1 : 0;
        const file = args.filter(a => !a.startsWith('-') && a !== delim && a !== args[fIdx + 1])[0];
        if (!file) return { output: 'cut: missing file operand', type: 'error' };
        const p = fs.resolvePath(file, cwd);
        const content = fs.readFile(p);
        if (content === null) return { output: `cut: '${file}': No such file`, type: 'error' };
        const result = content.split('\n').map(l => l.split(delim)[field] || '').join('\n');
        return { output: result, type: 'output' };
    },

    tr(args) {
        return { output: 'tr: reading from stdin not supported in this terminal. Use: echo "text" | tr SET1 SET2', type: 'info' };
    },

    diff(args) {
        const { params } = getFlags(args);
        if (params.length < 2) return { output: 'diff: missing operand', type: 'error' };
        const c1 = fs.readFile(fs.resolvePath(params[0], cwd));
        const c2 = fs.readFile(fs.resolvePath(params[1], cwd));
        if (c1 === null) return { output: `diff: ${params[0]}: No such file`, type: 'error' };
        if (c2 === null) return { output: `diff: ${params[1]}: No such file`, type: 'error' };
        if (c1 === c2) return { output: '', type: 'output' };
        const l1 = c1.split('\n'), l2 = c2.split('\n');
        const out = [];
        const max = Math.max(l1.length, l2.length);
        for (let i = 0; i < max; i++) {
            if (l1[i] !== l2[i]) out.push(`${i + 1}c${i + 1}\n< ${l1[i] || ''}\n---\n> ${l2[i] || ''}`);
        }
        return { output: out.join('\n'), type: 'output' };
    },

    chmod(args) {
        if (args.length < 2) return { output: 'chmod: missing operand', type: 'error' };
        const mode = args[0];
        const path = args[1];
        const p = fs.resolvePath(path, cwd);
        const node = fs.getNode(p);
        if (!node) return { output: `chmod: '${path}': No such file`, type: 'error' };

        if (/^[0-7]{3}$/.test(mode)) {
            const map = { '7': 'rwx', '6': 'rw-', '5': 'r-x', '4': 'r--', '3': '-wx', '2': '-w-', '1': '--x', '0': '---' };
            const u = map[mode[0]];
            const g = map[mode[1]];
            const o = map[mode[2]];
            node.permissions = (node.type === 'dir' ? 'd' : '-') + u + g + o;
            fs.save();
            return { output: '', type: 'output' };
        }
        return { output: 'chmod: mode not supported (use octal 755 etc)', type: 'error' };
    },

    chown(args) {
        if (args.length < 2) return { output: 'chown: missing operand', type: 'error' };
        return { output: '', type: 'output' };
    },

    ln(args) {
        const { flags, params } = getFlags(args);
        if (params.length < 2) return { output: 'ln: missing operand', type: 'error' };
        const src = fs.resolvePath(params[0], cwd);
        const dest = fs.resolvePath(params[1], cwd);
        fs.copyNode(src, dest);
        return { output: '', type: 'output' };
    },

    whoami() { return { output: 'asif', type: 'output' }; },
    hostname() { return { output: 'asif-linux', type: 'output' }; },
    id() { return { output: 'uid=1000(asif) gid=1000(asif) groups=1000(asif),4(adm),27(sudo)', type: 'output' }; },
    groups() { return { output: 'asif adm sudo', type: 'output' }; },

    uname(args) {
        const { flags } = getFlags(args);
        if (flags.has('-a')) return { output: 'Linux asif-linux 6.2.0-asif #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux', type: 'output' };
        if (flags.has('-r')) return { output: '6.2.0-asif', type: 'output' };
        if (flags.has('-m')) return { output: 'x86_64', type: 'output' };
        if (flags.has('-n')) return { output: 'asif-linux', type: 'output' };
        return { output: 'Linux', type: 'output' };
    },

    date() { return { output: new Date().toString(), type: 'output' }; },

    time(args) {
        if (!args.length) return { output: new Date().toLocaleTimeString(), type: 'output' };
        const start = performance.now();
        // naive reconstruction of command
        const cmdStr = args.map(a => a.includes(' ') ? `"${a}"` : a).join(' ');

        // We need to bypass the main process to avoid infinite recursion if we used processCommand
        // But we want to use executeCommand which is available in scope due to hoisting
        const result = executeCommand(cmdStr);

        const end = performance.now();
        const duration = ((end - start) / 1000).toFixed(3);

        const timing = `\nreal\t0m${duration}s\nuser\t0m0.001s\nsys\t0m0.002s`;

        return {
            output: (result.output ? result.output + '\n' : '') + timing,
            type: result.type
        };
    },

    cal() {
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();
        const firstDay = new Date(year, now.getMonth(), 1).getDay();
        const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();

        const title = `${month} ${year}`;
        const width = 20;
        const pad = Math.floor((width - title.length) / 2);

        const lines = [];
        lines.push(' '.repeat(Math.max(0, pad)) + title);
        lines.push('Su Mo Tu We Th Fr Sa');

        let currentLine = '';
        let currentDay = 0;

        // Initial padding
        for (let i = 0; i < firstDay; i++) {
            currentLine += '   ';
            currentDay++;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const esc = '\x1b';
            const dayStr = d === now.getDate() ? `${esc}[7m${d.toString().padStart(2, ' ')}${esc}[0m` : d.toString().padStart(2, ' ');
            currentLine += dayStr;

            if (currentDay === 6) {
                lines.push(currentLine);
                currentLine = '';
                currentDay = 0;
            } else {
                currentLine += ' ';
                currentDay++;
            }
        }

        if (currentLine) lines.push(currentLine);

        return { output: lines.join('\n'), type: 'output' };
    },

    uptime() {
        const start = window.performance?.timing?.navigationStart || Date.now();
        const uptimeMs = Date.now() - start;
        const hours = Math.floor(uptimeMs / 3600000);
        const minutes = Math.floor((uptimeMs % 3600000) / 60000);
        return { output: ` ${new Date().toLocaleTimeString()} up ${hours}:${minutes.toString().padStart(2, '0')}, 1 user, load average: 0.05, 0.03, 0.01`, type: 'output' };
    },

    calc(args) {
        if (!args.length) return { output: 'calc: missing expression', type: 'error' };
        try {
            // Safe evaluation
            const expr = args.join(' ').replace(/[^0-9+\-*/().% ]/g, '');
            if (!expr) return { output: 'calc: invalid expression', type: 'error' };
            // eslint-disable-next-line no-new-func
            const result = new Function(`return ${expr}`)();
            return { output: result.toString(), type: 'output' };
        } catch (e) {
            return { output: 'calc: evaluation error', type: 'error' };
        }
    },

    type(args) {
        if (!args.length) return { output: '', type: 'output' };
        const cmd = args[0];
        if (aliases[cmd]) return { output: `${cmd} is aliased to \`${aliases[cmd]}\``, type: 'output' };
        if (commands[cmd]) return { output: `${cmd} is a shell builtin`, type: 'output' };
        const bin = fs.resolvePath(`/usr/bin/${cmd}`, cwd);
        if (fs.exists(bin)) return { output: `${cmd} is /usr/bin/${cmd}`, type: 'output' };
        return { output: `-bash: type: ${cmd}: not found`, type: 'error' };
    },

    source(args) {
        if (!args.length) return { output: 'source: filename argument required', type: 'error' };
        const p = fs.resolvePath(args[0], cwd);
        if (!fs.exists(p)) return { output: `source: ${args[0]}: No such file or directory`, type: 'error' };
        // Simulate sourcing by just echoing content for now, real connect env var loading is complex
        return { output: `[Sourced ${args[0]}]`, type: 'info' };
    },
    '.'(args) { return commands.source(args); },

    free(args) {
        const { flags } = getFlags(args);
        const h = flags.has('-h') || flags.has('-m');
        return { output: `              total        used        free      shared  buff/cache   available\nMem:       ${h ? '16Gi' : '16384000'}    ${h ? '4.2Gi' : '4300000'}    ${h ? '8.0Gi' : '8192000'}    ${h ? '256Mi' : '262144'}    ${h ? '3.8Gi' : '3891856'}    ${h ? '11Gi' : '12084000'}\nSwap:      ${h ? '8.0Gi' : '8192000'}          0    ${h ? '8.0Gi' : '8192000'}`, type: 'output' };
    },

    df(args) {
        const { flags } = getFlags(args);
        return { output: `Filesystem      ${flags.has('-h') ? 'Size  Used Avail' : '1K-blocks    Used Available'} Use% Mounted on\n/dev/sda1       ${flags.has('-h') ? '50G   12G   35G' : '52428800 12582912 36700160'}  26% /\n/dev/sda2       ${flags.has('-h') ? '200G  45G  145G' : '209715200 47185920 152428544'}  24% /home\ntmpfs           ${flags.has('-h') ? '8.0G     0  8.0G' : '8192000        0   8192000'}   0% /dev/shm`, type: 'output' };
    },

    du(args) {
        const { flags, params } = getFlags(args);
        const target = params[0] ? fs.resolvePath(params[0], cwd) : cwd;
        const size = fs.getSize(target);
        const h = flags.has('-h');
        return { output: `${h ? formatSize(size) : size}\t${target}`, type: 'output' };
    },

    ps(args) {
        const { flags } = getFlags(args);
        if (flags.has('-e') || flags.has('-a') || args.includes('aux')) {
            return { output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1  16956  4532 ?        Ss   12:00   0:01 /sbin/init\nroot         2  0.0  0.0      0     0 ?        S    12:00   0:00 [kthreadd]\nroot       156  0.0  0.2  72312  8424 ?        Ss   12:00   0:00 /usr/sbin/sshd\nasif       892  0.0  0.1  21432  5680 pts/0    Ss   12:00   0:00 -bash\nasif      1024  0.1  0.3  45128 12340 pts/0    S+   12:05   0:02 node server.js\nasif      1156  0.0  0.1  18764  3456 pts/0    R+   12:10   0:00 ps aux`, type: 'output' };
        }
        return { output: `  PID TTY          TIME CMD\n  892 pts/0    00:00:00 bash\n 1156 pts/0    00:00:00 ps`, type: 'output' };
    },

    top() {
        return { output: `top - ${new Date().toLocaleTimeString()} up 1 day, 1 user, load average: 0.15, 0.10, 0.05\nTasks:  85 total,   1 running,  84 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  2.3 us,  1.0 sy,  0.0 ni, 96.5 id,  0.2 wa,  0.0 hi,  0.0 si\nMiB Mem :  16384.0 total,   8192.0 free,   4300.0 used,   3892.0 buff/cache\nMiB Swap:   8192.0 total,   8192.0 free,      0.0 used.  12084.0 avail Mem\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 1024 asif      20   0   45128  12340   8456 S   0.3   0.1   0:02.14 node\n  892 asif      20   0   21432   5680   3912 S   0.0   0.0   0:00.32 bash\n    1 root      20   0   16956   4532   3248 S   0.0   0.0   0:01.05 init`, type: 'output' };
    },

    kill(args) {
        if (!args.length) return { output: 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid', type: 'error' };
        return { output: '', type: 'output' };
    },

    ping(args) {
        if (!args.length) return { output: 'ping: usage error: Destination address required', type: 'error' };
        const host = args.filter(a => !a.startsWith('-'))[0];
        const ip = host === 'localhost' ? '127.0.0.1' : `${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        const lines = [`PING ${host} (${ip}) 56(84) bytes of data.`];
        for (let i = 0; i < 4; i++) {
            const time = (Math.random() * 50 + 5).toFixed(1);
            lines.push(`64 bytes from ${ip}: icmp_seq=${i + 1} ttl=64 time=${time} ms`);
        }
        lines.push(`\n--- ${host} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss\nrtt min/avg/max/mdev = 5.1/25.3/48.2/15.6 ms`);
        return { output: lines.join('\n'), type: 'output' };
    },

    ifconfig() {
        return { output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::1234:5678:abcd:ef01  prefixlen 64  scopeid 0x20<link>\n        ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)\n        RX packets 15423  bytes 12345678 (11.7 MiB)\n        TX packets 8234  bytes 6543210 (6.2 MiB)\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n        loop  txqueuelen 1000  (Local Loopback)`, type: 'output' };
    },

    ip(args) {
        if (args[0] === 'addr' || args[0] === 'a') return commands.ifconfig();
        if (args[0] === 'route') return { output: 'default via 192.168.1.1 dev eth0\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100', type: 'output' };
        return { output: 'Usage: ip [ addr | route | link ]', type: 'info' };
    },

    netstat() { return { output: 'Active Internet connections\nProto Recv-Q Send-Q Local Address         Foreign Address        State\ntcp        0      0 0.0.0.0:22            0.0.0.0:*              LISTEN\ntcp        0      0 0.0.0.0:80            0.0.0.0:*              LISTEN\ntcp        0      0 192.168.1.100:22      192.168.1.50:54321     ESTABLISHED', type: 'output' }; },
    ss() { return commands.netstat(); },

    curl(args) {
        if (!args.length) return { output: 'curl: try \'curl --help\' for more information', type: 'error' };
        return { output: `<!DOCTYPE html><html><head><title>Response</title></head><body><h1>200 OK</h1><p>Simulated response from ${args[args.length - 1]}</p></body></html>`, type: 'output' };
    },

    wget(args) {
        if (!args.length) return { output: 'wget: missing URL', type: 'error' };
        const url = args[args.length - 1];
        return { output: `--${new Date().toISOString()}--  ${url}\nResolving... connecting... HTTP request sent, awaiting response... 200 OK\nLength: 1234 (1.2K) [text/html]\nSaving to: 'index.html'\n\nindex.html          100%[===================>]   1.2K  --.-KB/s    in 0s\n\n${new Date().toISOString()} (12.3 MB/s) - 'index.html' saved [1234/1234]`, type: 'output' };
    },

    apt(args) { return commands['apt-get'](args); },
    'apt-get'(args) {
        if (!args.length) return { output: 'Usage: apt-get [update|upgrade|install|remove] [package]', type: 'error' };
        if (args[0] === 'update') return { output: 'Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease\nGet:2 http://security.ubuntu.com/ubuntu jammy-security InRelease [110 kB]\nReading package lists... Done', type: 'output' };
        if (args[0] === 'upgrade') return { output: 'Reading package lists... Done\nBuilding dependency tree... Done\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.', type: 'output' };
        if (args[0] === 'install') return { output: `Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  ${args.slice(1).join(' ')}\n0 upgraded, ${args.length - 1} newly installed, 0 to remove.\nSetting up ${args[1] || 'package'}... Done.`, type: 'output' };
        return { output: `apt-get: unknown command '${args[0]}'`, type: 'error' };
    },

    sudo(args) {
        if (!args.length) return { output: 'usage: sudo command', type: 'error' };
        if (envVars.USER === 'root') return executeCommand(args.join(' '));
        return {
            output: `[sudo] password for ${envVars.USER}:`,
            type: 'password-request',
            data: { cmd: args.join(' '), context: 'sudo' }
        };
    },

    su(args) {
        if (!args.length || args[0] === 'root') {
            if (envVars.USER === 'root') return { output: '', type: 'output' };
            return { output: 'Password:', type: 'password-request', data: { cmd: 'su', context: 'su' } };
        }
        if (args[0] === 'asif') {
            loginAs('asif');
            return { output: '', type: 'output' };
        }
        return { output: `su: user ${args[0]} does not exist`, type: 'error' };
    },

    passwd() { return { output: 'Changing password for asif.\nNew password: \npassword updated successfully', type: 'output' }; },
    useradd(args) { return { output: args.length ? '' : 'useradd: missing operand', type: args.length ? 'output' : 'error' }; },

    tree(args) {
        const target = args[0] ? fs.resolvePath(args[0], cwd) : cwd;
        const name = target === '/' ? '/' : target.split('/').pop();
        const result = fs.tree(target);
        const dirs = (result.match(/\//g) || []).length;
        const files = result.split('\n').filter(Boolean).length - dirs;
        return { output: `${name}\n${result}\n${dirs} directories, ${files} files`, type: 'output' };
    },

    file(args) {
        if (!args.length) return { output: 'Usage: file FILE', type: 'error' };
        const p = fs.resolvePath(args[0], cwd);
        const node = fs.getNode(p);
        if (!node) return { output: `${args[0]}: cannot open (No such file)`, type: 'error' };
        if (node.type === 'dir') return { output: `${args[0]}: directory`, type: 'output' };
        const ext = args[0].split('.').pop();
        const types = { py: 'Python script', sh: 'Bourne-Again shell script', txt: 'ASCII text', md: 'Markdown', js: 'JavaScript', json: 'JSON data', html: 'HTML document', css: 'CSS stylesheet', conf: 'configuration file' };
        return { output: `${args[0]}: ${types[ext] || 'regular file, ASCII text'}`, type: 'output' };
    },

    stat(args) {
        if (!args.length) return { output: 'stat: missing operand', type: 'error' };
        const p = fs.resolvePath(args[0], cwd);
        const node = fs.getNode(p);
        if (!node) return { output: `stat: '${args[0]}': No such file`, type: 'error' };
        const size = node.type === 'dir' ? 4096 : (node.size || 0);
        return { output: `  File: ${args[0]}\n  Size: ${size}\t\tBlocks: ${Math.ceil(size / 512) * 8}\t IO Block: 4096\t${node.type === 'dir' ? 'directory' : 'regular file'}\nAccess: (${node.permissions})\tUid: (1000/asif)\tGid: (1000/asif)\nAccess: 2026-02-15 12:00:00.000000000 +0530\nModify: 2026-02-15 12:00:00.000000000 +0530\nChange: 2026-02-15 12:00:00.000000000 +0530`, type: 'output' };
    },

    which(args) {
        if (!args.length) return { output: '', type: 'output' };
        const bins = ['ls', 'cat', 'cp', 'mv', 'rm', 'mkdir', 'grep', 'find', 'sort', 'bash', 'sh', 'python3', 'node', 'git', 'vim', 'nano', 'curl', 'wget', 'ssh', 'tar', 'gzip', 'awk', 'sed'];
        if (bins.includes(args[0])) return { output: `/usr/bin/${args[0]}`, type: 'output' };
        return { output: `${args[0]} not found`, type: 'error' };
    },

    whereis(args) {
        if (!args.length) return { output: '', type: 'output' };
        return { output: `${args[0]}: /usr/bin/${args[0]} /usr/share/man/man1/${args[0]}.1.gz`, type: 'output' };
    },

    env() {
        return { output: Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join('\n'), type: 'output' };
    },

    export(args) {
        if (!args.length) return commands.env();
        args.forEach(a => { const [k, ...v] = a.split('='); if (k) envVars[k] = v.join('='); });
        return { output: '', type: 'output' };
    },

    set() { return commands.env(); },
    printenv() { return commands.env(); },

    alias(args) {
        if (!args.length) return { output: Object.entries(aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n'), type: 'output' };
        const [name, ...val] = args.join(' ').split('=');
        aliases[name] = val.join('=').replace(/['"]/g, '');
        return { output: '', type: 'output' };
    },

    unalias(args) {
        if (args[0]) delete aliases[args[0]];
        return { output: '', type: 'output' };
    },

    history() {
        return { output: history.map((h, i) => `  ${(i + 1).toString().padStart(4)}  ${h}`).join('\n'), type: 'output' };
    },

    clear() { return { output: '__CLEAR__', type: 'output' }; },

    man(args) {
        if (!args.length) return { output: 'What manual page do you want?', type: 'error' };
        const manPages = {
            ls: 'LS(1)\n\nNAME\n    ls - list directory contents\n\nSYNOPSIS\n    ls [OPTION]... [FILE]...\n\nOPTIONS\n    -a    do not ignore entries starting with .\n    -l    use a long listing format\n    -h    human-readable sizes\n    -R    list subdirectories recursively',
            cd: 'CD(1)\n\nNAME\n    cd - change the working directory\n\nSYNOPSIS\n    cd [dir]\n\nDESCRIPTION\n    Change the current directory to dir. Default is $HOME.',
            grep: 'GREP(1)\n\nNAME\n    grep - print lines matching a pattern\n\nSYNOPSIS\n    grep [OPTIONS] PATTERN [FILE]\n\nOPTIONS\n    -i    ignore case\n    -n    show line numbers\n    -v    invert match\n    -c    count matches',
            cat: 'CAT(1)\n\nNAME\n    cat - concatenate files and print\n\nSYNOPSIS\n    cat [OPTION]... [FILE]...\n\nOPTIONS\n    -n    number all output lines',
            chmod: 'CHMOD(1)\n\nNAME\n    chmod - change file mode bits\n\nSYNOPSIS\n    chmod [OPTION]... MODE FILE...',
            find: 'FIND(1)\n\nNAME\n    find - search for files\n\nSYNOPSIS\n    find [path] -name [pattern]',
        };
        return { output: manPages[args[0]] || `No manual entry for ${args[0]}`, type: manPages[args[0]] ? 'output' : 'error' };
    },

    help() {
        return { output: `ASIF Linux Terminal - Available Commands:\n\n📁 File Management:     ls, cat, touch, rm, cp, mv, mkdir, rmdir, head, tail, ln, file, stat\n📂 Navigation:          cd, pwd, tree, find, which, whereis\n📝 Text Processing:     echo, grep, sort, uniq, wc, cut, diff, tr, sed, awk\n💻 System Info:         uname, hostname, whoami, date, uptime, free, df, du, cal, id\n🔧 Process:            ps, top, kill\n🌐 Network:            ping, ifconfig, ip, curl, wget, netstat, ss\n👤 User Management:    useradd, passwd, su, sudo, groups\n🔒 Permissions:        chmod, chown\n📦 Package:            apt, apt-get\n🗜️ Archive:            tar, zip, unzip, gzip\n⚙️ Environment:        env, export, alias, unalias, set, printenv\n📖 Help:               man, help, history\n🧹 Terminal:           clear\n\nTip: Use pipes (|) and redirections (>, >>) for advanced usage!`, type: 'info' };
    },

    tar(args) {
        if (!args.length) return { output: 'tar: need to specify one option', type: 'error' };
        if (args[0].includes('c')) return { output: 'tar: archive created (simulated)', type: 'output' };
        if (args[0].includes('x')) return { output: 'tar: archive extracted (simulated)', type: 'output' };
        if (args[0].includes('t')) return { output: 'file1.txt\nfile2.txt\ndir1/', type: 'output' };
        return { output: 'tar: invalid option', type: 'error' };
    },

    zip(args) { return { output: args.length > 1 ? `  adding: ${args[1]} (stored 0%)` : 'zip: missing arguments', type: args.length > 1 ? 'output' : 'error' }; },
    unzip(args) { return { output: args.length ? `Archive: ${args[0]}\n  inflating: file1.txt` : 'unzip: missing archive', type: args.length ? 'output' : 'error' }; },
    gzip(args) { return { output: args.length ? '' : 'gzip: missing file', type: args.length ? 'output' : 'error' }; },

    lsblk() { return { output: 'NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT\nsda      8:0    0   256G  0 disk\n├─sda1   8:1    0    50G  0 part /\n├─sda2   8:2    0   198G  0 part /home\n└─sda3   8:3    0     8G  0 part [SWAP]', type: 'output' }; },

    mount() { return { output: '/dev/sda1 on / type ext4 (rw,relatime)\n/dev/sda2 on /home type ext4 (rw,relatime)\ntmpfs on /dev/shm type tmpfs (rw,nosuid,nodev)', type: 'output' }; },

    w() { return { output: ` ${new Date().toLocaleTimeString()} up 1 day,  1 user,  load average: 0.15, 0.10, 0.05\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\nasif     pts/0    192.168.1.50     12:00    0.00s  0.05s  0.01s w`, type: 'output' }; },
    who() { return { output: 'asif     pts/0        2026-02-15 12:00 (192.168.1.50)', type: 'output' }; },
    last() { return { output: 'asif     pts/0        192.168.1.50     Sat Feb 15 12:00   still logged in\nreboot   system boot  6.2.0-asif       Sat Feb 15 12:00   still running\n\nwtmp begins Sat Feb 15 12:00:00 2026', type: 'output' }; },

    dmesg() { return { output: '[    0.000000] Linux version 6.2.0-asif\n[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-6.2.0-asif root=/dev/sda1\n[    0.123456] CPU: Intel(R) Core(TM) i7-12700K @ 3.60GHz\n[    0.234567] Memory: 16384MB available\n[    1.000000] systemd[1]: Detected architecture x86-64.\n[    1.100000] systemd[1]: Set hostname to <asif-linux>.', type: 'output' }; },

    systemctl(args) {
        if (!args.length) return { output: 'Usage: systemctl [start|stop|status|restart] service', type: 'error' };
        if (args[0] === 'status') return { output: `● ${args[1] || 'system'}.service - ${args[1] || 'System'} Service\n   Loaded: loaded\n   Active: active (running)\n   PID: ${Math.floor(Math.random() * 9000) + 1000}`, type: 'output' };
        return { output: '', type: 'output' };
    },

    sed(args) { return { output: 'sed: stream editor (basic simulation - use echo "text" | sed for full usage)', type: 'info' }; },
    awk(args) { return { output: 'awk: pattern scanning (basic simulation)', type: 'info' }; },
    xargs(args) { return { output: 'xargs: (simulated)', type: 'info' }; },
    crontab(args) {
        if (args[0] === '-l') return { output: '# no crontab for asif', type: 'output' };
        return { output: 'crontab: usage: crontab [-l|-e|-r]', type: 'info' };
    },

    nslookup(args) {
        if (!args.length) return { output: 'Usage: nslookup hostname', type: 'error' };
        return { output: `Server:  8.8.8.8\nAddress: 8.8.8.8#53\n\nNon-authoritative answer:\nName: ${args[0]}\nAddress: ${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, type: 'output' };
    },

    dig(args) { return commands.nslookup(args); },
    traceroute(args) {
        if (!args.length) return { output: 'Usage: traceroute hostname', type: 'error' };
        let out = `traceroute to ${args[0]}, 30 hops max\n`;
        for (let i = 1; i <= 5; i++) out += ` ${i}  ${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}  ${(Math.random() * 20 + 1).toFixed(1)} ms\n`;
        return { output: out, type: 'output' };
    },

    ssh(args) { return { output: args.length ? `ssh: connect to host ${args[0]}: Connection simulated` : 'usage: ssh user@hostname', type: 'info' }; },
    scp(args) { return { output: 'scp: secure copy (simulated)', type: 'info' }; },

    neofetch() {
        return { output: `        .--.         asif@asif-linux\n       |o_o |        ───────────────\n       |:_/ |        OS: ASIF Linux 1.0 x86_64\n      //   \\ \\       Kernel: 6.2.0-asif\n     (|     | )      Uptime: 1 day\n    /'\\_   _/\`\\      Shell: bash 5.2.15\n    \\___)=(___/      Terminal: ASIF Terminal\n                     CPU: Intel i7-12700K (12) @ 3.6GHz\n                     Memory: 4300MiB / 16384MiB`, type: 'info' };
    },

    screenfetch() { return commands.neofetch(); },

    exit() {
        if (envVars.USER === 'root') {
            loginAs('asif');
            return { output: 'logout', type: 'output' };
        }
        return { output: '__LOGOUT__', type: 'output' };
    },
    logout() { return { output: '__LOGOUT__', type: 'output' }; },
    nano(args) {
        if (!args.length) return { output: 'nano: missing filename', type: 'error' };
        const p = fs.resolvePath(args[0], cwd);
        const content = fs.readFile(p);
        return {
            output: '__NANO__',
            type: 'nano',
            data: {
                path: p,
                displayPath: args[0],
                content: content === null ? '' : content,
                isNew: content === null
            }
        };
    },

    reboot(args) {
        if (envVars.USER !== 'root') {
            return { output: 'reboot: Need to be root', type: 'error' };
        }
        return { output: '__REBOOT__', type: 'reboot' };
    },

    shutdown(args) {
        if (envVars.USER !== 'root') {
            return { output: 'shutdown: Need to be root', type: 'error' };
        }
        return { output: '__SHUTDOWN__', type: 'shutdown' };
    },

    bash(args) {
        if (!args.length) {
            return { output: 'GNU bash, version 5.0.17(1)-release (x86_64-pc-linux-gnu)\nType "exit" to logout.', type: 'info' };
        }
        const filename = args[0];
        const p = fs.resolvePath(filename, cwd);
        const content = fs.readFile(p);

        if (content === null) {
            return { output: `bash: ${filename}: No such file or directory`, type: 'error' };
        }

        // Execute script lines
        const lines = content.split('\n');
        let output = '';

        // Simple script execution (synchronous)
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // recursion check: don't allow executing the same script infinitely
            if (trimmed.startsWith('bash ') && trimmed.includes(filename)) {
                output += `bash: ${filename}: infinite recursion detected\n`;
                break;
            }

            const result = executeCommand(trimmed);
            if (result.output) {
                output += (output ? '\n' : '') + result.output;
            }
        }

        return { output: output || '', type: 'output' };
    },

    python(args) {
        if (!args.length) {
            return {
                output: `Python 3.8.10 (default, Mar 15 2022, 12:22:08) 
[GCC 9.4.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> `,
                type: 'info'
            };
        }

        if (args[0] === '--version' || args[0] === '-V') {
            return { output: 'Python 3.8.10', type: 'output' };
        }

        const filename = args[0];
        const p = fs.resolvePath(filename, cwd);
        const content = fs.readFile(p);

        if (content === null) {
            return { output: `python: can't open file '${filename}': [Errno 2] No such file or directory`, type: 'error' };
        }

        // Very basic Python simulation
        const lines = content.split('\n');
        let output = '';
        const vars = {};

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Handle print()
            if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
                const inner = trimmed.substring(6, trimmed.length - 1);
                // Handle string literals
                if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
                    output += (output ? '\n' : '') + inner.substring(1, inner.length - 1);
                }
                // Handle numbers/math
                else if (!isNaN(Number(inner))) {
                    output += (output ? '\n' : '') + inner;
                }
                // Handle variables
                else if (vars[inner] !== undefined) {
                    output += (output ? '\n' : '') + vars[inner];
                }
                // Handle basic math expression (very simple)
                else {
                    try {
                        // Safe evaluation of math only
                        if (/^[\d\s+\-*/()]+$/.test(inner)) {
                            // eslint-disable-next-line no-eval
                            output += (output ? '\n' : '') + eval(inner);
                        } else {
                            output += (output ? '\n' : '') + `Traceback (most recent call last):\n  File "${filename}", line 1, in <module>\nNameError: name '${inner}' is not defined`;
                        }
                    } catch (e) {
                        output += (output ? '\n' : '') + `SyntaxError: invalid syntax`;
                    }
                }
            }
            // Handle simple assignment: x = 10
            else if (trimmed.includes('=')) {
                const parts = trimmed.split('=').map(p => p.trim());
                if (parts.length === 2) {
                    const name = parts[0];
                    const val = parts[1];
                    if (!isNaN(Number(val))) {
                        vars[name] = Number(val);
                    } else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        vars[name] = val.substring(1, val.length - 1);
                    }
                }
            }
        }

        return { output: output || '', type: 'output' };
    },

    git(args) {
        if (!args.length) {
            return { output: 'usage: git <command> [<args>]', type: 'info' };
        }

        const subCmd = args[0];
        const gitDir = fs.resolvePath('.git', cwd);
        const hasGit = fs.getDir(gitDir) !== null;

        if (subCmd === 'init') {
            if (hasGit) {
                return { output: `Reinitialized existing Git repository in ${cwd}/.git/`, type: 'info' };
            }
            fs.mkdir(gitDir);
            // Create initial config files for simulation
            const configPath = fs.resolvePath('.git/config', cwd);
            fs.writeFile(configPath, '[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n\tlogallrefupdates = true');
            const headPath = fs.resolvePath('.git/HEAD', cwd);
            fs.writeFile(headPath, 'ref: refs/heads/master');
            const logsPath = fs.resolvePath('.git/logs', cwd);
            fs.mkdir(logsPath);
            return { output: `Initialized empty Git repository in ${cwd}/.git/`, type: 'info' };
        }

        if (subCmd === 'clone') {
            if (!args[1]) return { output: 'fatal: You must specify a repository to clone.', type: 'error' };
            const repoUrl = args[1];
            const repoName = repoUrl.split('/').pop().replace('.git', '') || 'repo';
            const targetPath = fs.resolvePath(repoName, cwd);

            if (fs.getDir(targetPath)) return { output: `fatal: destination path '${repoName}' already exists and is not an empty directory.`, type: 'error' };

            fs.mkdir(targetPath);
            fs.mkdir(targetPath + '/.git');
            fs.writeFile(targetPath + '/README.md', `# ${repoName}\n\nCloned from ${repoUrl}`);
            return {
                output: `Cloning into '${repoName}'...\nremote: Enumerating objects: 10, done.\nremote: Counting objects: 100% (10/10), done.\nremote: Compressing objects: 100% (8/8), done.\nremote: Total 10 (delta 0), reused 10 (delta 0), pack-reused 0\nReceiving objects: 100% (10/10), done.`,
                type: 'info'
            };
        }

        if (subCmd === 'help') {
            return { output: 'usage: git <command> [<args>]\n\nThese are common Git commands used in various situations:\n\n   init       Create an empty Git repository or reinitialize an existing one\n   clone      Clone a repository into a new directory\n   add        Add file contents to the index\n   status     Show the working tree status\n   commit     Record changes to the repository\n   log        Show commit logs\n   branch     List, create, or delete branches\n   checkout   Switch branches or restore working tree files', type: 'info' };
        }

        if (!hasGit && subCmd !== 'clone') {
            return { output: 'fatal: not a git repository (or any of the parent directories): .git', type: 'error' };
        }

        if (subCmd === 'status') {
            // Simulated status
            const files = fs.listDir(cwd).filter(f => f !== '.git' && f !== '.DS_Store');
            if (files.length === 0) return { output: 'On branch master\nNo commits yet\n\nnothing to commit (create/copy files and use "git add" to track)', type: 'info' };

            // Check if we have a simulated "staging" area
            const stagingPath = fs.resolvePath('.git/staging', cwd);
            const stagingContent = fs.readFile(stagingPath) || '';
            const stagedFiles = stagingContent ? stagingContent.split('\n').filter(Boolean) : [];

            let output = 'On branch master\n';

            // Very simple mocked logic: if file is in staging, it's green. If not, it's red "untracked".
            const untracked = files.filter(f => !stagedFiles.includes(f));

            if (stagedFiles.length > 0) {
                output += 'Changes to be committed:\n  (use "git rm --cached <file>..." to unstage)\n';
                stagedFiles.forEach(f => {
                    output += `\x1b[1;32m\tnew file:   ${f}\x1b[0m\n`;
                });
                output += '\n';
            }

            if (untracked.length > 0) {
                output += 'Untracked files:\n  (use "git add <file>..." to include in what will be committed)\n';
                untracked.forEach(f => {
                    output += `\x1b[1;31m\t${f}\x1b[0m\n`;
                });
            }

            if (stagedFiles.length === 0 && untracked.length === 0) {
                output += 'nothing to commit, working tree clean';
            }

            return { output: output.trim(), type: 'output' };
        }

        if (subCmd === 'add') {
            if (!args[1]) return { output: 'Nothing specified, nothing added.', type: 'info' };

            const filesToAdd = args.slice(1);
            const stagingPath = fs.resolvePath('.git/staging', cwd);
            let currentStaged = (fs.readFile(stagingPath) || '').split('\n').filter(Boolean);

            if (filesToAdd.includes('.')) {
                // Add all files
                const allFiles = fs.listDir(cwd).filter(f => f !== '.git');
                currentStaged = [...new Set([...currentStaged, ...allFiles])];
            } else {
                // Add specific files - basic check if they exist
                for (const f of filesToAdd) {
                    if (fs.exists(fs.resolvePath(f, cwd))) {
                        currentStaged.push(f);
                    } else {
                        return { output: `fatal: pathspec '${f}' did not match any files`, type: 'error' };
                    }
                }
                currentStaged = [...new Set(currentStaged)];
            }

            fs.writeFile(stagingPath, currentStaged.join('\n'));
            return { output: '', type: 'output' };
        }

        if (subCmd === 'commit') {
            const msgIndex = args.indexOf('-m');
            if (msgIndex === -1 || !args[msgIndex + 1]) return { output: 'error: no commit message present', type: 'error' };
            const message = args[msgIndex + 1].replace(/['"]/g, '');

            const stagingPath = fs.resolvePath('.git/staging', cwd);
            const currentStaged = (fs.readFile(stagingPath) || '').split('\n').filter(Boolean);

            if (currentStaged.length === 0) {
                return { output: 'On branch master\nInitial commit\n\nfluntracted files present (use "git add" to track)', type: 'info' };
            }

            // Create commit log
            const logsPath = fs.resolvePath('.git/logs/HEAD', cwd);
            const currentLogs = fs.readFile(logsPath) || '';
            const timestamp = new Date().toString();
            const commitHash = Math.random().toString(16).substr(2, 7);
            const author = envVars.USER;

            const newLog = `commit ${commitHash}\nAuthor: ${author} <${author}@localhost>\nDate:   ${timestamp}\n\n    ${message}\n\n`;
            fs.writeFile(logsPath, newLog + currentLogs);

            // Clear staging
            fs.writeFile(stagingPath, '');

            return { output: `[master (root-commit) ${commitHash}] ${message}\n ${currentStaged.length} file(s) changed, 1 insertion(+)`, type: 'output' };
        }

        if (subCmd === 'log') {
            const logsPath = fs.resolvePath('.git/logs/HEAD', cwd);
            const logs = fs.readFile(logsPath);
            if (!logs) return { output: 'fatal: your current branch \'master\' does not have any commits yet', type: 'error' };
            return { output: logs.trim(), type: 'output' };
        }

        if (subCmd === 'branch') {
            return { output: '* master', type: 'output' };
        }

        return { output: `git: '${subCmd}' is not a git command. See 'git --help'.`, type: 'error' };
    },
};

function executeSingle(input) {
    const trimmed = input.trim();
    if (!trimmed) return { output: '', type: 'output' };

    // Handle redirection
    let redirectFile = null, appendMode = false;
    let cmdStr = trimmed;
    if (cmdStr.includes('>>')) {
        const parts = cmdStr.split('>>');
        cmdStr = parts[0].trim();
        redirectFile = parts[1].trim();
        appendMode = true;
    } else if (cmdStr.includes('>')) {
        const parts = cmdStr.split('>');
        cmdStr = parts[0].trim();
        redirectFile = parts[1].trim();
    }

    const allArgs = parseArgs(cmdStr);
    let cmd = allArgs[0];
    let args = allArgs.slice(1);

    // Resolve alias
    if (aliases[cmd]) {
        const expanded = parseArgs(aliases[cmd]);
        cmd = expanded[0];
        args = [...expanded.slice(1), ...args];
    }

    const handler = commands[cmd];
    let result;
    if (handler) {
        result = handler(args);
    } else {
        result = { output: `${cmd}: command not found`, type: 'error' };
    }

    // Handle redirection
    if (redirectFile && result.output) {
        const path = fs.resolvePath(redirectFile, cwd);
        if (appendMode) fs.appendFile(path, result.output + '\n');
        else fs.writeFile(path, result.output + '\n');
        return { output: '', type: 'output' };
    }

    return result;
}

function executeCommand(input) {
    // Handle pipes
    if (input.includes('|')) {
        const cmds = input.split('|').map(s => s.trim());
        let lastOutput = '';
        for (const cmd of cmds) {
            const result = executeSingle(cmd + (lastOutput ? '' : ''));
            lastOutput = result.output;
        }
        return { output: lastOutput, type: 'output' };
    }
    return executeSingle(input);
}

export function performAuthAction(context, cmd) {
    if (context === 'sudo') {
        if (cmd === 'su' || cmd.startsWith('su ')) {
            loginAs('root');
            return [];
        }
        const prevUser = envVars.USER;
        envVars.USER = 'root';
        const results = processCommand(cmd, true);
        envVars.USER = prevUser;
        return results;
    }
    if (context === 'su') {
        loginAs('root');
        return [];
    }
    return [];
}

export function processCommand(input, skipHistory = false) {
    if (!input.trim()) return [];

    // History Expansion
    let expanded = false;

    // !! substitution
    if (input.includes('!!')) {
        const last = history.length ? history[history.length - 1] : '';
        if (!last) return [{ type: 'error', output: '!!: event not found' }];
        input = input.replace(/!!/g, last);
        expanded = true;
    }
    // !n or !prefix
    else if (input.startsWith('!')) {
        let replacement = '';
        if (/^!\d+$/.test(input)) {
            const n = parseInt(input.slice(1));
            if (n > 0 && n <= history.length) replacement = history[n - 1];
        } else {
            const prefix = input.slice(1);
            for (let i = history.length - 1; i >= 0; i--) {
                if (history[i].startsWith(prefix)) {
                    replacement = history[i];
                    break;
                }
            }
        }

        if (!replacement) return [{ type: 'error', output: `${input}: event not found` }];
        input = replacement;
        expanded = true;
    }

    if (!skipHistory) history.push(input);
    const results = expanded ? [{ output: input, type: 'info' }] : [];

    // Handle chaining with ; and &&
    const parts = input.split(/\s*;\s*/);
    for (const part of parts) {
        const andParts = part.split(/\s*&&\s*/);
        for (const andPart of andParts) {
            const result = executeCommand(andPart.trim());
            if (result.output) results.push(result);
            if (result.type === 'error') break;
        }
    }

    return results;
}
