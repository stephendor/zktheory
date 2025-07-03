# GitBook + Netlify Setup Guide

## 📚 Setting Up Your GitBook Repository on Netlify

### **Step 1: Prepare Your GitBook Repository**

1. **Navigate to your GitBook repository**: `https://github.com/stephendor/zkproofbook`

2. **Add these files to your repository**:
   - Copy `gitbook-netlify.toml` → rename to `netlify.toml`
   - Copy `gitbook-package.json` → rename to `package.json`
3. **Commit and push** these files to your repository

### **Step 2: Create New Netlify Site**

1. **Go to Netlify Dashboard**: https://app.netlify.com/
2. **Click "Add new site"** → "Import an existing project"
3. **Choose GitHub** and authorize if needed
4. **Select repository**: `stephendor/zkproofbook`

### **Step 3: Configure Build Settings**

Netlify should auto-detect the `netlify.toml`, but verify these settings:

- **Base directory**: (leave blank)
- **Build command**: `npm install -g gitbook-cli && gitbook install && gitbook build`
- **Publish directory**: `_book`
- **Node version**: 16

### **Step 4: Set Up Custom Domain**

1. **After deployment**, go to Site Settings → Domain management
2. **Add custom domain**: `docs.zktheory.org`
3. **Configure DNS** (if you control the domain):
   - Add CNAME record: `docs` → `your-site-name.netlify.app`
4. **Enable HTTPS** (automatic with Netlify)

### **Step 5: Update Main Site**

Once your GitBook is live at `docs.zktheory.org`, update the iframe URL in your main site.

## 🔧 **Troubleshooting**

### **Build Fails?**

- Check that your GitBook repository has proper `book.json` and `README.md`
- Verify GitBook structure follows standard conventions
- Check build logs in Netlify dashboard

### **GitBook Plugins Not Working?**

- Add plugin dependencies to `package.json`
- Update `book.json` with required plugins
- Some older plugins may need Node.js version adjustments

### **Custom Domain Not Working?**

- Verify DNS propagation (can take up to 24 hours)
- Check domain ownership in Netlify
- Ensure CNAME points to correct Netlify subdomain

## 📝 **Expected File Structure in GitBook Repo**

```
zkproofbook/
├── netlify.toml          # Build configuration
├── package.json          # Dependencies
├── book.json            # GitBook configuration
├── README.md            # Introduction page
├── SUMMARY.md           # Table of contents
└── chapters/            # Your content
    ├── chapter1.md
    ├── chapter2.md
    └── ...
```

## 🎯 **Benefits After Setup**

✅ **SSL Certificate**: Automatic HTTPS from Netlify
✅ **Custom Domain**: Clean `docs.zktheory.org` URL
✅ **Auto-Deploy**: Updates when you push to GitBook repo
✅ **No iframe Issues**: Direct hosting eliminates security problems
✅ **Search Integration**: Content can be indexed by main site search
✅ **Performance**: Faster loading than iframe embedding
