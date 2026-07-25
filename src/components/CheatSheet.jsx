import { useState } from 'react'

const cheatData = [
    {
        category: 'File Management',
        icon: '📁',
        color: 'green',
        commands: [
            { cmd: 'ls', desc: 'List directory contents' },
            { cmd: 'ls -la', desc: 'List all files with details' },
            { cmd: 'cat file', desc: 'Display file content' },
            { cmd: 'cat -n file', desc: 'Display with line numbers' },
            { cmd: 'touch file', desc: 'Create an empty file' },
            { cmd: 'rm file', desc: 'Remove a file' },
            { cmd: 'rm -rf dir', desc: 'Remove directory recursively' },
            { cmd: 'cp src dest', desc: 'Copy file or directory' },
            { cmd: 'mv src dest', desc: 'Move or rename file' },
            { cmd: 'head -n 5 file', desc: 'Show first 5 lines' },
            { cmd: 'tail -n 5 file', desc: 'Show last 5 lines' },
            { cmd: 'ln -s src link', desc: 'Create symbolic link' },
            { cmd: 'file name', desc: 'Determine file type' },
            { cmd: 'stat file', desc: 'Display file status' },
        ]
    },
    {
        category: 'Directory Navigation',
        icon: '📂',
        color: 'cyan',
        commands: [
            { cmd: 'pwd', desc: 'Print working directory' },
            { cmd: 'cd /path', desc: 'Change directory' },
            { cmd: 'cd ~', desc: 'Go to home directory' },
            { cmd: 'cd ..', desc: 'Go up one directory' },
            { cmd: 'mkdir dirname', desc: 'Create a directory' },
            { cmd: 'rmdir dirname', desc: 'Remove empty directory' },
            { cmd: 'tree', desc: 'Display directory tree' },
            { cmd: 'find / -name "*.txt"', desc: 'Find files by name' },
            { cmd: 'which cmd', desc: 'Locate a command' },
            { cmd: 'whereis cmd', desc: 'Locate binary/source/man' },
        ]
    },
    {
        category: 'Text Processing',
        icon: '📝',
        color: 'purple',
        commands: [
            { cmd: 'echo "text"', desc: 'Print text to terminal' },
            { cmd: 'grep pattern file', desc: 'Search for pattern in file' },
            { cmd: 'grep -i pattern file', desc: 'Case-insensitive search' },
            { cmd: 'grep -n pattern file', desc: 'Search with line numbers' },
            { cmd: 'grep -v pattern file', desc: 'Invert match (exclude)' },
            { cmd: 'sort file', desc: 'Sort file content' },
            { cmd: 'sort -r file', desc: 'Sort in reverse order' },
            { cmd: 'uniq file', desc: 'Remove duplicate lines' },
            { cmd: 'wc file', desc: 'Count lines, words, chars' },
            { cmd: 'wc -l file', desc: 'Count lines only' },
            { cmd: 'cut -d":" -f1 file', desc: 'Cut fields from lines' },
            { cmd: 'diff file1 file2', desc: 'Compare two files' },
            { cmd: 'sed', desc: 'Stream editor' },
            { cmd: 'awk', desc: 'Pattern scanning tool' },
        ]
    },
    {
        category: 'System Information',
        icon: '💻',
        color: 'yellow',
        commands: [
            { cmd: 'uname -a', desc: 'Full system information' },
            { cmd: 'hostname', desc: 'Display hostname' },
            { cmd: 'whoami', desc: 'Current logged-in user' },
            { cmd: 'id', desc: 'User/group identity info' },
            { cmd: 'date', desc: 'Current date and time' },
            { cmd: 'cal', desc: 'Display calendar' },
            { cmd: 'uptime', desc: 'System uptime' },
            { cmd: 'free -h', desc: 'Memory usage (human)' },
            { cmd: 'df -h', desc: 'Disk space usage' },
            { cmd: 'du -h dir', desc: 'Directory disk usage' },
            { cmd: 'neofetch', desc: 'System info with ASCII art' },
            { cmd: 'lsblk', desc: 'List block devices' },
            { cmd: 'dmesg', desc: 'Kernel ring buffer messages' },
            { cmd: 'mount', desc: 'Show mounted filesystems' },
        ]
    },
    {
        category: 'Process Management',
        icon: '🔧',
        color: 'red',
        commands: [
            { cmd: 'ps', desc: 'List current processes' },
            { cmd: 'ps aux', desc: 'All processes detailed' },
            { cmd: 'top', desc: 'Real-time process monitor' },
            { cmd: 'kill PID', desc: 'Kill process by PID' },
            { cmd: 'kill -9 PID', desc: 'Force kill process' },
            { cmd: 'systemctl status svc', desc: 'Check service status' },
            { cmd: 'systemctl start svc', desc: 'Start a service' },
            { cmd: 'systemctl stop svc', desc: 'Stop a service' },
        ]
    },
    {
        category: 'Network Commands',
        icon: '🌐',
        color: 'cyan',
        commands: [
            { cmd: 'ping host', desc: 'Ping a host' },
            { cmd: 'ifconfig', desc: 'Network interface config' },
            { cmd: 'ip addr', desc: 'Show IP addresses' },
            { cmd: 'ip route', desc: 'Show routing table' },
            { cmd: 'curl URL', desc: 'Transfer data from URL' },
            { cmd: 'wget URL', desc: 'Download files from web' },
            { cmd: 'netstat', desc: 'Network statistics' },
            { cmd: 'ss', desc: 'Socket statistics' },
            { cmd: 'nslookup host', desc: 'DNS lookup' },
            { cmd: 'traceroute host', desc: 'Trace network route' },
            { cmd: 'ssh user@host', desc: 'Secure shell connection' },
        ]
    },
    {
        category: 'User & Permissions',
        icon: '🔒',
        color: 'orange',
        commands: [
            { cmd: 'sudo command', desc: 'Execute as superuser' },
            { cmd: 'su', desc: 'Switch user' },
            { cmd: 'useradd name', desc: 'Add a new user' },
            { cmd: 'passwd', desc: 'Change password' },
            { cmd: 'groups', desc: 'Show user groups' },
            { cmd: 'chmod 755 file', desc: 'Change file permissions' },
            { cmd: 'chown user file', desc: 'Change file owner' },
            { cmd: 'who', desc: 'Show logged-in users' },
            { cmd: 'w', desc: 'Who is doing what' },
            { cmd: 'last', desc: 'Last logged-in users' },
        ]
    },
    {
        category: 'Package & Archive',
        icon: '📦',
        color: 'green',
        commands: [
            { cmd: 'apt update', desc: 'Update package lists' },
            { cmd: 'apt upgrade', desc: 'Upgrade all packages' },
            { cmd: 'apt install pkg', desc: 'Install a package' },
            { cmd: 'tar -czf a.tar.gz dir', desc: 'Create gzip archive' },
            { cmd: 'tar -xzf a.tar.gz', desc: 'Extract gzip archive' },
            { cmd: 'zip out.zip files', desc: 'Create zip archive' },
            { cmd: 'unzip file.zip', desc: 'Extract zip archive' },
            { cmd: 'gzip file', desc: 'Compress with gzip' },
        ]
    },
    {
        category: 'Environment & Shell',
        icon: '⚙️',
        color: 'purple',
        commands: [
            { cmd: 'env', desc: 'Show environment variables' },
            { cmd: 'export VAR=val', desc: 'Set environment variable' },
            { cmd: 'echo $VAR', desc: 'Print variable value' },
            { cmd: 'alias name=cmd', desc: 'Create command alias' },
            { cmd: 'unalias name', desc: 'Remove an alias' },
            { cmd: 'history', desc: 'Show command history' },
            { cmd: 'clear', desc: 'Clear the terminal' },
            { cmd: 'man command', desc: 'Show manual page' },
            { cmd: 'crontab -l', desc: 'List cron jobs' },
        ]
    },
    {
        category: 'Pipes & Redirection',
        icon: '🔀',
        color: 'yellow',
        commands: [
            { cmd: 'cmd > file', desc: 'Redirect output to file' },
            { cmd: 'cmd >> file', desc: 'Append output to file' },
            { cmd: 'cmd1 | cmd2', desc: 'Pipe output to command' },
            { cmd: 'cmd1 && cmd2', desc: 'Run cmd2 if cmd1 succeeds' },
            { cmd: 'cmd1 ; cmd2', desc: 'Run commands sequentially' },
            { cmd: 'echo "hi" > f.txt', desc: 'Write text to file' },
        ]
    }
]

const categories = ['All', ...cheatData.map(c => c.category)]

export default function CheatSheet() {
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')
    const [copiedCmd, setCopiedCmd] = useState('')

    const filtered = cheatData
        .filter(cat => activeCategory === 'All' || cat.category === activeCategory)
        .map(cat => ({
            ...cat,
            commands: cat.commands.filter(c =>
                c.cmd.toLowerCase().includes(search.toLowerCase()) ||
                c.desc.toLowerCase().includes(search.toLowerCase())
            )
        }))
        .filter(cat => cat.commands.length > 0)

    const copyCmd = (cmd) => {
        navigator.clipboard?.writeText(cmd)
        setCopiedCmd(cmd)
        setTimeout(() => setCopiedCmd(''), 2000)
    }

    return (
        <div className="cheatsheet-container">
            <div className="cheatsheet-hero">
                <h1>📖 Linux Command Cheat Sheet</h1>
                <p>Master the command line with this comprehensive reference. Click any command to copy it!</p>
                <div className="cheatsheet-search">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search commands..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="cheatsheet-categories">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="cheatsheet-grid">
                {filtered.map((cat, i) => (
                    <div key={i} className="cheatsheet-card">
                        <div className="card-header">
                            <div className={`card-icon ${cat.color}`}>{cat.icon}</div>
                            <div>
                                <div className="card-title">{cat.category}</div>
                                <div className="card-subtitle">{cat.commands.length} commands</div>
                            </div>
                        </div>
                        <div className="card-body">
                            {cat.commands.map((c, j) => (
                                <div key={j} className="command-item">
                                    <span className="command-syntax" onClick={() => copyCmd(c.cmd)} title="Click to copy">
                                        {c.cmd}
                                    </span>
                                    <span className="command-desc">{c.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {copiedCmd && <div className="copy-toast">✓ Copied: {copiedCmd}</div>}
        </div>
    )
}
