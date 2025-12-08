# Custom Domain Setup for Workshop No. 5

## 🌐 Current URLs
- **Firebase Default**: https://workshopno5.web.app
- **Firebase Custom**: https://workshopno5.firebaseapp.com  
- **Target Custom Domain**: workshopno5.com (when ready)

## 🔧 Setting Up Custom Domain

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/workshopno5/overview)
2. Navigate to **Hosting** in the left sidebar
3. Click on your site (workshopno5)
4. Click **"Add custom domain"**

### Step 2: Domain Configuration Options

#### Option A: Root Domain (workshopno5.com)
```
Type: A Record
Host: @ (or leave blank)
Value: (Firebase will provide IP addresses)
```

#### Option B: Subdomain (www.workshopno5.com)  
```
Type: CNAME
Host: www
Value: workshopno5.web.app
```

#### Option C: Both (Recommended)
Set up both root and www, with redirect from one to the other.

### Step 3: DNS Configuration

Firebase will provide you with DNS records to add to your domain registrar:

**For A Records** (root domain):
```
A @ 151.101.1.195
A @ 151.101.65.195
```

**For CNAME** (subdomain):
```
CNAME www workshopno5.web.app
```

### Step 4: SSL Certificate
Firebase automatically provisions SSL certificates via Let's Encrypt:
- ✅ **Free SSL**: Automatic HTTPS
- ✅ **Auto-renewal**: Certificates renew automatically
- ✅ **Modern TLS**: TLS 1.3 support

### Step 5: Verification Process
1. Add DNS records at your domain registrar
2. Firebase verifies domain ownership (can take 24-48 hours)
3. SSL certificate is provisioned automatically
4. Domain becomes active with HTTPS

## 🏗️ Domain Registrar Instructions

### GoDaddy
1. Go to DNS Management
2. Add A records or CNAME as specified
3. Save changes (propagation: 1-48 hours)

### Namecheap  
1. Go to Advanced DNS
2. Add records as specified by Firebase
3. Save changes

### Google Domains
1. Go to DNS settings
2. Add custom resource records
3. Save changes

### CloudFlare
1. Add A/CNAME records in DNS management
2. Ensure proxy is disabled (gray cloud) for initial setup
3. Can enable proxy after domain is verified

## 📧 Email Configuration (If Needed)

If you need email for the domain:

### Google Workspace (Recommended)
```
MX @ 1 smtp.google.com
MX @ 5 alt1.gmail-smtp-in.l.google.com
MX @ 5 alt2.gmail-smtp-in.l.google.com
MX @ 10 alt3.gmail-smtp-in.l.google.com
MX @ 10 alt4.gmail-smtp-in.l.google.com
```

### Basic Email Forwarding
Many registrars offer free email forwarding:
- info@workshopno5.com → your.email@gmail.com

## 🔄 Redirect Configuration

Update Firebase configuration for proper redirects:

```json
{
  "hosting": {
    "public": "dist/workshop-no-5",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "redirects": [
      {
        "source": "/old-path/**",
        "destination": "/new-path/**",
        "type": 301
      }
    ],
    "headers": [
      {
        "source": "**/*.@(eot|otf|ttf|ttc|woff|font.css)",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin", 
            "value": "*"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=604800"
          }
        ]
      }
    ]
  }
}
```

## 🎯 SEO Configuration for Custom Domain

### Update HTML Base Tag
```html
<base href="https://workshopno5.com/">
```

### Update Open Graph URLs
```html
<meta property="og:url" content="https://workshopno5.com/" />
```

### Update Sitemap
```xml
<loc>https://workshopno5.com/</loc>
```

### Submit to Search Engines
1. **Google Search Console**:
   - Add property for https://workshopno5.com
   - Submit sitemap: https://workshopno5.com/sitemap.xml

2. **Bing Webmaster Tools**:
   - Add and verify domain
   - Submit sitemap

## ⚡ Performance Optimizations

Firebase Hosting includes:
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **HTTP/2**: Modern protocol support  
- ✅ **Gzip Compression**: Automatic file compression
- ✅ **Cache Headers**: Optimized caching
- ✅ **SSL/TLS**: Secure connections

## 🔍 Testing Custom Domain

### Before DNS Propagation
Test using hosts file temporarily:
```
# Add to C:\Windows\System32\drivers\etc\hosts (Windows)
# Add to /etc/hosts (Mac/Linux)
151.101.1.195 workshopno5.com
151.101.1.195 www.workshopno5.com
```

### After DNS Propagation
1. **Test HTTPS**: https://workshopno5.com should load with valid SSL
2. **Test Redirects**: Ensure www redirects properly
3. **Test Analytics**: Verify GA4 tracking still works
4. **Test All Pages**: Check navigation and portfolio loading

## 📋 Pre-Launch Checklist

Before pointing domain to Firebase:

- [ ] Firebase project is fully configured
- [ ] Website is thoroughly tested at workshopno5.web.app  
- [ ] Analytics tracking is verified and working
- [ ] All assets load correctly (images, fonts, etc.)
- [ ] Contact forms work properly
- [ ] 404 page displays correctly
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags are complete

## 🚨 Important Notes

1. **DNS Propagation**: Can take 24-48 hours globally
2. **SSL Certificate**: May take additional time after DNS propagation  
3. **Backup Plan**: Keep Firebase default URL as fallback
4. **Testing**: Thoroughly test before final DNS switch
5. **Monitoring**: Watch analytics for any traffic issues

Your Workshop No. 5 website is ready for custom domain deployment! 🌟