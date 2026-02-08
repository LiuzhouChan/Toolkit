# Toolkit

A collection of Windows utilities and scripts to automate tasks and improve productivity.

## 📁 Repository Structure

Each tool is organized in its own folder with:
- Scripts and executables
- Dedicated README with installation and usage instructions
- Configuration files (if needed)

## 🛠️ Available Tools

### [`keep-speaker-alive/`](./keep-speaker-alive)

Prevents Bluetooth speakers from auto-disconnecting by playing a quiet tone every 10 minutes.

**Features:**
- Runs hidden in background
- Auto-starts with Windows
- Minimal resource usage
- Customizable interval and audio settings

[📖 View detailed documentation](./keep-speaker-alive/README.md)

### [`microsoft-edge-extension/rewards/`](./microsoft-edge-extension/rewards)

Microsoft Edge extension that helps complete Microsoft Rewards daily search tasks.

**Features:**
- Automatically opens Bing searches in new tabs
- Customizable search count and interval
- Custom search terms with category presets
- Settings sync across devices
- Modern Fluent Design UI

[📖 View detailed documentation](./microsoft-edge-extension/rewards/README.md)

## 🤖 Installing Tools with AI Agents

Each tool folder contains a README with specific installation instructions. To install any tool using an AI agent (like OpenCode, GitHub Copilot, etc.), use this pattern:

```
Navigate to the [tool-name] folder and follow the installation instructions in its README. 
Install the tool to run at Windows startup by:
1. Reading the README installation section
2. Creating necessary shortcuts/tasks as documented
3. Verifying the installation
4. Testing the tool functionality
```

**Example for keep-speaker-alive:**

```
Install the keep-speaker-alive tool from the keep-speaker-alive folder. 
Follow the README to:
1. Create a Windows Startup shortcut
2. Configure it to run the VBS launcher
3. Verify it's working
```

The agent will:
- Read the tool's README for specific steps
- Generate appropriate PowerShell commands
- Create shortcuts or scheduled tasks
- Verify successful installation

## 🚀 Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/Toolkit.git
   cd Toolkit
   ```

2. Navigate to the tool you want to use:
   ```bash
   cd keep-speaker-alive
   ```

3. Read the tool's README for specific installation and usage instructions

## 📝 Adding New Tools

When adding a new tool to this repository:

1. **Create a dedicated folder** with a descriptive name (e.g., `new-tool-name/`)

2. **Include a comprehensive README.md** with:
   - Tool description and features
   - Installation instructions (manual and AI-assisted)
   - Usage examples
   - Configuration options
   - Troubleshooting section
   - Uninstallation steps

3. **Update this main README** to:
   - Add the tool to the "Available Tools" section
   - Link to the tool's README
   - Briefly describe what it does

4. **Follow these conventions:**
   - Use clear, descriptive file names
   - Include comments in scripts
   - Provide both manual and automated installation methods
   - Document AI agent installation prompts
   - Include examples for common use cases

## 🤝 Contributing

Feel free to submit issues or pull requests for:
- Bug fixes
- New tools
- Documentation improvements
- Feature enhancements

## 📄 License

See [LICENSE](./LICENSE) file for details.

## 💡 Tips for AI Agents

When working with this repository:

1. **Always read the tool's README first** before attempting installation
2. **Follow the documented AI installation prompts** for consistent results
3. **Verify each step** (shortcut creation, file placement, permissions)
4. **Test the tool** after installation to confirm it works
5. **Use PowerShell commands** for Windows-specific operations
6. **Check for existing processes** before starting new instances

### Common AI Agent Commands

**Install a tool:**
```
Install the [tool-name] tool following its README installation guide
```

**Verify installation:**
```
Check if [tool-name] is installed correctly and running as expected
```

**Uninstall a tool:**
```
Uninstall [tool-name] following its README uninstallation guide
```
