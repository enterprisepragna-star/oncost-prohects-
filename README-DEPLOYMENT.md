# Hostinger Deployment Guide - ONCOST Website

Complete step-by-step instructions for deploying the ONCOST website to Hostinger with the `oncost.shop` domain.

---

## 1. Prerequisites Checklist

Before beginning the deployment process, ensure all prerequisites are met:

- [x] **Domain Purchased**: `oncost.shop` domain registered and active
- [ ] **Hostinger Account Active**: Account is set up with hosting plan
- [ ] **FTP/File Manager Access**: Credentials obtained and tested
- [ ] **Files Ready for Production**: All HTML, CSS, and JS files optimized
- [ ] **SSL Certificate Available**: Hostinger SSL enabled (usually auto-provisioned)
- [ ] **Email Forwarding Setup**: If using email notifications
- [ ] **Backup of Local Files**: Full project backup created

**Estimated Time**: 30-45 minutes for complete deployment

---

## 2. File Structure to Upload

### Complete File List for Public HTML

Upload these files to `/public_html/` directory on Hostinger:

```
public_html/
├── index.html              (Homepage)
├── products.html           (Products listing page)
├── product.html            (Individual product page)
├── cart.html               (Shopping cart)
├── checkout.html           (Checkout page - if applicable)
├── account.html            (User account dashboard)
├── login.html              (Login page)
├── signup.html             (Registration page)
├── payment.html            (Payment page)
├── enquiry.html            (Contact/Enquiry form)
├── site.css                (Main stylesheet)
├── app.js                  (Main JavaScript application)
├── .htaccess               (Apache configuration for routing)
└── [any other assets]      (Images, documents, fonts)
```

### Folder Structure (if applicable):

If you have subdirectories for assets:
```
public_html/
├── images/                 (Product images, logos, banners)
├── css/                    (Additional stylesheets if separated)
├── js/                     (Additional JavaScript files)
├── assets/                 (Fonts, documents, downloads)
└── [other directories]
```

**Total Upload Size**: Typically 2-10 MB (varies by image optimization)

---

## 3. Step-by-Step Upload Instructions

### Method A: Using Hostinger File Manager (Recommended for Beginners)

**Step 1: Access Hostinger Control Panel**
1. Go to `https://hostinger.com`
2. Log in to your account with email and password
3. Click on "Hosting" in the main menu
4. Select your hosting account (oncost.shop)

**Step 2: Open File Manager**
1. In the hosting dashboard, find and click "File Manager"
2. You'll see the directory structure with folders like `public_html`, `logs`, `backups`
3. Double-click on `public_html` to enter the folder

**Step 3: Upload Files**
1. Click the "Upload" button (usually in the toolbar)
2. Select all files from your local project directory
3. Wait for the upload to complete (watch the progress bar)

**Step 4: Verify Upload**
1. Refresh the file manager view
2. Confirm all files appear in `public_html`
3. Check file count matches your local directory

### Method B: Using FTP (Command Line or FTP Client)

**Step 1: Obtain FTP Credentials**
1. In Hostinger Control Panel, go to "Account" or "FTP Accounts"
2. Create or retrieve FTP credentials:
   - **FTP Host**: `ftp.oncost.shop` or your Hostinger FTP address
   - **FTP Username**: Usually your domain or hosting account username
   - **FTP Password**: Your hosting account password
   - **FTP Port**: 21 (standard) or 22 (SFTP)

**Step 2: Connect Using FTP Client (e.g., FileZilla)**
1. Download and install FileZilla (free FTP client)
2. Open FileZilla and go to File → Site Manager
3. Create new site with credentials:
   ```
   Host: ftp.oncost.shop
   Protocol: FTP
   Port: 21
   Logon Type: Normal
   User: [Your FTP Username]
   Password: [Your FTP Password]
   ```
4. Click Connect

**Step 3: Navigate and Upload**
1. In FileZilla right panel, navigate to `/public_html/`
2. In left panel, open your local project folder
3. Select all files (Ctrl+A)
4. Drag and drop to right panel, or right-click → Upload

**Step 4: Using Command Line (Linux/Mac/Windows PowerShell)**
```bash
# Using curl with FTP
cd /path/to/ONCOST\ WEBSITE

# Upload a single file
curl -T index.html ftp://username:password@ftp.oncost.shop/public_html/

# Upload multiple files using a script
for file in *.html *.css *.js; do
  curl -T "$file" ftp://username:password@ftp.oncost.shop/public_html/
done
```

### File Upload Order (Priority)

Upload files in this order to ensure functionality:

1. **Critical Files First**
   - `.htaccess` (routing configuration)
   - `index.html` (homepage)

2. **Core Application**
   - `app.js` (main application logic)
   - `site.css` (main stylesheet)

3. **Page Files**
   - `products.html`
   - `product.html`
   - `cart.html`
   - `account.html`
   - `login.html`
   - `signup.html`
   - `payment.html`
   - `enquiry.html`

4. **Assets & Resources**
   - Images and media files
   - Additional stylesheets
   - Additional JavaScript files

5. **Support Files**
   - Any configuration files
   - Documentation files

---

## 4. DNS Configuration

### Verify Domain is Connected to Hostinger

**Step 1: Check Nameservers**
1. Log in to your domain registrar (where you purchased oncost.shop)
2. Go to Domain Management → DNS Settings
3. Verify nameservers are set to Hostinger:
   ```
   ns1.hostinger.com
   ns2.hostinger.com
   ns3.hostinger.com
   ns4.hostinger.com
   ```

If nameservers are different, update them to Hostinger nameservers above.

### Configure DNS Records in Hostinger

**Step 1: Access DNS Manager**
1. Log in to Hostinger Control Panel
2. Go to Domains → Your Domain (oncost.shop)
3. Click "DNS Records" or "Manage DNS"

**Step 2: Configure A Record (Main Domain)**
1. Find the A record for `oncost.shop` (without www)
2. Ensure it points to your Hostinger server IP:
   ```
   Type: A
   Name: @
   Value: [Your Hostinger Server IP]
   TTL: 3600 (or Auto)
   ```

**Step 3: Configure CNAME for www Subdomain**
1. Add or update CNAME record:
   ```
   Type: CNAME
   Name: www
   Value: oncost.shop
   TTL: 3600 (or Auto)
   ```

This makes `www.oncost.shop` point to `oncost.shop`

**Step 4: Optional - Configure Other Subdomains**
If you need API or other subdomains:
```
Type: A
Name: api
Value: [Your Hostinger Server IP]
TTL: 3600

Type: CNAME
Name: shop
Value: oncost.shop
TTL: 3600
```

### DNS Propagation

**Propagation Time**: 2-24 hours (typically 2-4 hours)

**During Propagation**:
- Domain may not be immediately accessible worldwide
- Some users may see the old site if they cached previous DNS
- Refresh browser cache or use incognito mode
- Use online DNS checker: `https://dnschecker.org`

**How to Check DNS Status**:
```bash
# Using nslookup (Windows PowerShell)
nslookup oncost.shop

# Using dig (Mac/Linux)
dig oncost.shop

# Expected result
oncost.shop A [Your Hostinger IP]
www.oncost.shop CNAME oncost.shop
```

---

## 5. Post-Upload Verification

### Test Using Hosts File (Local Testing Before DNS Propagation)

On Windows, test the site before DNS updates globally:

**Step 1: Edit Hosts File (Windows)**
1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add these lines at the end:
   ```
   [Your Hostinger IP]  oncost.shop
   [Your Hostinger IP]  www.oncost.shop
   ```
4. Save the file
5. Flush DNS cache:
   ```powershell
   ipconfig /flushdns
   ```

**Step 2: Test in Browser**
1. Open browser and visit: `http://oncost.shop`
2. Check that index.html loads
3. Navigate to: `http://www.oncost.shop`

**Step 3: Remove Hosts File Entry**
Once DNS propagates globally, remove the test entries from hosts file.

### Verify All Files Uploaded Correctly

**Step 1: Check File Permissions**
1. In Hostinger File Manager, right-click each HTML file
2. Properties → Permissions
3. Set to: `644` (read/write for owner, read-only for others)
4. Set folder permissions to: `755`

**Step 2: Verify File Structure**
1. Access Hostinger File Manager
2. Confirm all files from step 2 are present
3. Check folder structure matches your local setup
4. Verify no files are corrupted (check file sizes)

**Step 3: Test All URLs After DNS Propagation**

Wait for DNS to propagate (2-24 hours), then test:

| Page | URL | Expected Result |
|------|-----|-----------------|
| Homepage | `https://oncost.shop` | index.html loads with CSS and images |
| Homepage (www) | `https://www.oncost.shop` | Same as above, redirects to main domain |
| Products | `https://oncost.shop/products.html` | Products page loads correctly |
| Product Detail | `https://oncost.shop/product.html` | Individual product page loads |
| Cart | `https://oncost.shop/cart.html` | Shopping cart page accessible |
| Account | `https://oncost.shop/account.html` | Account dashboard accessible |
| Login | `https://oncost.shop/login.html` | Login page loads |
| Sign Up | `https://oncost.shop/signup.html` | Registration page loads |
| Payment | `https://oncost.shop/payment.html` | Payment page loads |
| Enquiry | `https://oncost.shop/enquiry.html` | Contact form page loads |

### SSL Certificate Activation

**Step 1: Enable Auto SSL (Usually Automatic)**
1. In Hostinger Control Panel → Domains → oncost.shop
2. Find "SSL Certificate" section
3. Status should show "Active" (auto-provisioned with free Let's Encrypt)

**Step 2: Verify HTTPS Works**
1. Visit `https://oncost.shop` in browser
2. Look for green padlock icon
3. Click padlock to view certificate details
4. Confirm certificate is valid and not expired

**Step 3: Force HTTPS Redirect**
Add to `.htaccess` to automatically redirect HTTP to HTTPS:
```apache
# Force HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

**Step 4: Test HTTPS**
1. Try visiting `http://oncost.shop` (without https)
2. Should automatically redirect to `https://oncost.shop`
3. Verify all content loads over HTTPS

---

## 6. Troubleshooting Common Issues

### Issue: 404 Errors on All Pages

**Cause**: Incorrect `.htaccess` configuration or missing mod_rewrite

**Solution**:
1. Verify `.htaccess` is uploaded to `/public_html/`
2. Check `.htaccess` permissions (644)
3. Verify Apache mod_rewrite is enabled:
   - In Hostinger: Hosting → Server Settings → Modules
   - Look for `mod_rewrite` - should be enabled
4. If using custom routing, ensure `.htaccess` contains:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule ^(.*)$ index.html [L,QSA]
   </IfModule>
   ```

### Issue: CSS and JavaScript Not Loading

**Cause**: Incorrect file paths or absolute vs relative URLs

**Solution**:
1. Check console for 404 errors (F12 → Console tab)
2. Verify stylesheet path in HTML:
   ```html
   <!-- ✓ Correct (relative path) -->
   <link rel="stylesheet" href="site.css">
   
   <!-- ✗ Avoid absolute paths -->
   <link rel="stylesheet" href="/site.css">
   ```
3. For JavaScript in HTML:
   ```html
   <!-- ✓ Correct -->
   <script src="app.js"></script>
   
   <!-- ✗ Avoid -->
   <script src="/app.js"></script>
   ```
4. Hard refresh browser (Ctrl+Shift+R) to clear cache
5. Check if assets are in correct subdirectories if used

### Issue: Email Form Not Sending

**Cause**: Form handler not configured for server environment

**Solution**:
1. If using PHP form handler, ensure file has `.php` extension
2. Verify form action points to correct handler:
   ```html
   <form action="handler.php" method="POST">
   ```
3. Check Hostinger email settings:
   - Hosting → Email → Verify sender email is set up
   - Create email account if needed
4. For client-side JavaScript form handling:
   - Ensure API endpoints are configured for production
   - Check CORS settings if using external API
5. Test form submission and check email inbox (may take 1-2 minutes)

### Issue: HTTPS Not Working or SSL Certificate Error

**Cause**: SSL not activated or certificate needs renewal

**Solution**:
1. Verify SSL is active in Hostinger (usually automatic)
2. Wait 24 hours after domain DNS setup for Let's Encrypt to provision cert
3. Force certificate renewal:
   - Hosting → Domains → SSL Certificate → Renew
4. Clear browser cache and try again
5. Test with different browser (Safari, Chrome, Firefox)
6. Check SSL status: `https://www.sslshopper.com/ssl-checker.html`

### Issue: Site Shows Hostinger Default Page or Old Version

**Cause**: Files not uploaded to correct directory or browser cache

**Solution**:
1. Verify files are in `/public_html/` (not in subdirectories)
2. Check index.html is present and named correctly
3. Clear browser cache:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Develop → Empty Web Site Cache
4. Try in incognito/private mode
5. Wait 24 hours for DNS to fully propagate
6. Force DNS flush:
   ```powershell
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemctl restart systemd-resolved
   ```

### Issue: Images Not Displaying

**Cause**: Incorrect image paths

**Solution**:
1. Check image paths in HTML/CSS use relative paths:
   ```html
   <!-- ✓ Correct -->
   <img src="images/product.jpg" alt="Product">
   
   <!-- ✗ Wrong -->
   <img src="/images/product.jpg" alt="Product">
   ```
2. Verify image files are uploaded to same directories as local
3. Check file names match exactly (case-sensitive on Linux servers)
4. Use browser DevTools (F12) to identify missing image URLs
5. Ensure images are in `public_html` directory

---

## 7. Performance Optimization Tips

### Cache Clearing

**Browser Cache**:
```
Chrome: Settings → Privacy and Security → Clear Browsing Data
Firefox: Preferences → Privacy & Security → Clear Data
Safari: Develop → Empty Web Site Cache
```

**Server Cache** (Hostinger Control Panel):
1. Hosting → Performance → Caching
2. Click "Clear Cache" button
3. Wait 5 minutes for new cache to build

### Image Optimization

**Before Upload**:
1. Compress images using TinyPNG or ImageOptim
2. Convert large images to WebP format
3. Use appropriate dimensions (resize to display size, not original)
4. Target image sizes: 
   - Product thumbnails: 200-300px wide
   - Product detail images: 400-600px wide
   - Banners: 1200px wide max

**In HTML**:
```html
<!-- Lazy loading for images -->
<img src="image.jpg" alt="Description" loading="lazy">

<!-- Responsive images -->
<img srcset="image-small.jpg 400w, image-large.jpg 800w" 
     sizes="(max-width: 600px) 400px, 800px"
     src="image.jpg" alt="Description">
```

### Minifying CSS and JavaScript

**If Not Already Minified**:

1. Use online minifiers:
   - CSS: `https://cssminifier.com`
   - JS: `https://javascript-minifier.com`

2. Or use build tools:
   ```bash
   # Using npm (if available)
   npm install -g terser cssnano
   
   # Minify CSS
   cssnano site.css -o site.min.css
   
   # Minify JS
   terser app.js -o app.min.js
   ```

3. Update HTML to use minified versions:
   ```html
   <link rel="stylesheet" href="site.min.css">
   <script src="app.min.js"></script>
   ```

### Enable Gzip Compression

Add to `.htaccess`:
```apache
# Enable Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### Browser Caching

Add to `.htaccess`:
```apache
# Cache files for 30 days
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 7 days"
  ExpiresByType text/css "access plus 30 days"
  ExpiresByType application/javascript "access plus 30 days"
  ExpiresByType image/jpeg "access plus 60 days"
  ExpiresByType image/png "access plus 60 days"
  ExpiresByType image/gif "access plus 60 days"
  ExpiresByType application/font-woff "access plus 1 year"
</IfModule>
```

---

## 8. Monitoring & Maintenance

### Google Analytics Setup

**Step 1: Create Google Analytics Account**
1. Go to `https://analytics.google.com`
2. Sign in with Google account
3. Click "Start Measuring"
4. Create new property for "oncost.shop"
5. Get your Tracking ID (format: UA-XXXXXXX-X or G-XXXXXXX)

**Step 2: Add Tracking Code to Website**
Add to `<head>` section of every HTML file:
```html
<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

**Step 3: Verify Tracking**
1. Visit your website
2. In Google Analytics → Real-time → Overview
3. Should show your current session within 30 seconds

### Email Bounce Handling

**Monitor for Bounces**:
1. Hostinger Control Panel → Email → Bounce Management
2. Review bounced emails weekly
3. Remove invalid addresses from mailing list
4. Check sender reputation score

**Reduce Bounces**:
- Validate email addresses before sending
- Use proper sender name and email
- Include unsubscribe link in emails
- Monitor spam complaints

### Regular Backups

**Automatic Backups** (Hostinger):
1. Hostinger Control Panel → Backups
2. Verify automatic daily backups are enabled
3. Check backup storage shows recent dates

**Manual Backup Steps**:
1. Monthly - Download full backup:
   - Hosting → Backups → Download
2. Store backup files locally
3. Keep minimum 3 backups on rotation

**Backup Checklist**:
- [ ] Database (if using)
- [ ] All HTML/CSS/JS files
- [ ] Images and media
- [ ] Configuration files
- [ ] Email accounts

### SSL Certificate Renewal

**Let's Encrypt (Free, Auto-Renews)**:
- Hostinger auto-renews Let's Encrypt certificates
- No action needed - happens automatically 30 days before expiration
- Verify certificate is valid: `https://www.ssllabs.com`

**Certificate Monitoring**:
1. Monthly check certificate expiration:
   ```bash
   # Check certificate expiration
   openssl s_client -connect oncost.shop:443 -servername oncost.shop
   ```
2. In Hostinger → Domains → SSL Certificate
3. Status should show "Active" and expiration date

**If Certificate Fails**:
1. Contact Hostinger Support
2. Manually request new Let's Encrypt certificate
3. Wait 24 hours for provisioning

### Weekly Monitoring Checklist

- [ ] Visit `https://oncost.shop` and test all pages
- [ ] Check that all CSS/images load correctly
- [ ] Test contact form submission
- [ ] Check Google Analytics for traffic
- [ ] Review email logs for errors
- [ ] Verify SSL certificate is valid
- [ ] Check disk usage hasn't exceeded limits

### Monthly Maintenance

- [ ] Download and verify backup
- [ ] Update content if needed
- [ ] Review and optimize images
- [ ] Check for broken links
- [ ] Review 404 error logs
- [ ] Update DNS records if needed
- [ ] Test all forms and functionality

### Urgent: If Site Goes Down

1. Check Hostinger Status Page: `https://status.hostinger.com`
2. Log into Hostinger Panel and check:
   - Hosting account is active
   - Disk space not exceeded
   - Bandwidth not exceeded
3. Verify files are in `/public_html/`
4. Contact Hostinger Support for immediate help
5. Have backup ready to restore

---

## Quick Reference URLs

After successful deployment, use these URLs:

| Site Section | URL |
|--------------|-----|
| Homepage | `https://oncost.shop` |
| Homepage (www) | `https://www.oncost.shop` |
| Products | `https://oncost.shop/products.html` |
| Product Detail | `https://oncost.shop/product.html` |
| Shopping Cart | `https://oncost.shop/cart.html` |
| Checkout | `https://oncost.shop/checkout.html` |
| Account | `https://oncost.shop/account.html` |
| Login | `https://oncost.shop/login.html` |
| Register | `https://oncost.shop/signup.html` |
| Payment | `https://oncost.shop/payment.html` |
| Contact/Enquiry | `https://oncost.shop/enquiry.html` |

**All URLs should load with HTTPS and display the green security padlock.**

---

## Deployment Checklist

Complete this checklist as you follow the guide:

### Pre-Deployment
- [ ] All files optimized for production
- [ ] CSS/JS paths are relative (not absolute)
- [ ] Images compressed and optimized
- [ ] .htaccess file reviewed
- [ ] Local backup created

### Upload Phase
- [ ] Connected to Hostinger (FTP or File Manager)
- [ ] Navigated to `/public_html/` directory
- [ ] All files uploaded successfully
- [ ] File permissions set (644 for files, 755 for directories)
- [ ] No upload errors

### DNS & SSL
- [ ] Domain nameservers point to Hostinger
- [ ] A record configured for `oncost.shop`
- [ ] CNAME record configured for `www.oncost.shop`
- [ ] SSL certificate is active
- [ ] DNS propagation checked (use dnschecker.org)

### Verification
- [ ] Tested all page URLs
- [ ] CSS and images load correctly
- [ ] Forms are functional
- [ ] HTTPS works (green padlock visible)
- [ ] Mobile responsive design works
- [ ] Analytics code installed and tracking

### Post-Deployment
- [ ] Informed team of live URL
- [ ] Set up email monitoring
- [ ] Configured backups
- [ ] Scheduled regular monitoring
- [ ] Documentation updated

---

## Support & Resources

- **Hostinger Support**: `https://hostinger.com/help`
- **SSL Checker**: `https://www.sslshopper.com/ssl-checker.html`
- **DNS Checker**: `https://dnschecker.org`
- **Website Testing**: `https://www.websiteplanetesting.com`
- **Performance**: `https://gtmetrix.com`

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Deployment  

For questions or issues, refer to the troubleshooting section above or contact Hostinger Support.
