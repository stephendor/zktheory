#!/bin/bash

# Cayley Graph Explorer Setup Script
# This script helps set up the environment for running the full Jupyter notebook

echo "🔧 Cayley Graph Explorer Setup"
echo "================================"

# Check if SageMath is installed
if command -v sage &> /dev/null; then
    echo "✅ SageMath found: $(sage --version | head -n1)"
else
    echo "❌ SageMath not found. Please install SageMath first."
    echo "   Visit: https://www.sagemath.org/download.html"
    echo "   Or use conda: conda install -c conda-forge sage"
    exit 1
fi

# Check if Jupyter is available in SageMath
if sage -c "import jupyter" &> /dev/null; then
    echo "✅ Jupyter available in SageMath"
else
    echo "❌ Jupyter not available in SageMath"
    echo "   Installing Jupyter in SageMath..."
    sage -pip install jupyter ipywidgets
fi

# Check if required packages are available
echo "🔍 Checking required packages..."

# Check for ipywidgets
if sage -c "import ipywidgets" &> /dev/null; then
    echo "✅ ipywidgets available"
else
    echo "⚠️  Installing ipywidgets..."
    sage -pip install ipywidgets
fi

# Enable jupyter widgets extension
echo "🔧 Enabling Jupyter widgets..."
sage -sh -c "jupyter nbextension enable --py widgetsnbextension --sys-prefix" &> /dev/null

# Create a launch script
echo "📝 Creating launch script..."
cat > launch_cayley_explorer.sh << 'EOF'
#!/bin/bash
echo "🚀 Launching Cayley Graph Explorer"
echo "=================================="
echo "Opening Jupyter notebook with SageMath kernel..."
echo "The notebook will open in your default browser."
echo ""
echo "To use the interactive features:"
echo "1. Run all cells in the notebook"
echo "2. Scroll to the bottom to see the interactive interface"
echo "3. Select group type, parameter, and generators"
echo "4. Click 'Generate Cayley Graph' to create visualizations"
echo ""
echo "Press Ctrl+C in this terminal to stop the notebook server"
echo ""

# Change to the notebook directory and launch
cd "$(dirname "$0")"
sage -n jupyter InteractiveCayley.ipynb
EOF

chmod +x launch_cayley_explorer.sh

# Create a requirements file for reference
cat > sage_requirements.txt << 'EOF'
# SageMath requirements for Cayley Graph Explorer
# Install these packages within SageMath using: sage -pip install <package>

jupyter>=1.0.0
ipywidgets>=7.0.0
notebook>=6.0.0

# Optional but recommended:
matplotlib>=3.0.0
numpy>=1.16.0
EOF

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To run the interactive Cayley Graph Explorer:"
echo "   ./launch_cayley_explorer.sh"
echo ""
echo "Or manually:"
echo "   sage -n jupyter InteractiveCayley.ipynb"
echo ""
echo "📚 For help and documentation:"
echo "   - See CAYLEY_GRAPH_README.md"
echo "   - Visit the web interface at /projects/cayleygraph"
echo "   - Check SageMath documentation: https://doc.sagemath.org/"
echo ""
echo "🌐 The web interface provides a simplified version."
echo "   For full functionality, use the Jupyter notebook."
