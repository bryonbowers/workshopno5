# Google Analytics 4 Setup Instructions

## 🎯 Setting Up GA4 for Workshop No. 5

### Step 1: Create GA4 Property

1. **Go to Google Analytics**: Visit [analytics.google.com](https://analytics.google.com)

2. **Create Account** (if needed):
   - Click "Start measuring"
   - Account Name: "Workshop No. 5"
   - Check appropriate data sharing settings

3. **Create Property**:
   - Property Name: "Workshop No. 5 Website"
   - Reporting Time Zone: "United States - Central Time"
   - Currency: "US Dollar"

4. **Business Information**:
   - Industry Category: "Architecture & Design" or "Professional Services"
   - Business Size: Choose appropriate size
   - Business Objectives: Select "Get baseline reports"

5. **Data Stream Setup**:
   - Platform: "Web"
   - Website URL: `https://workshopno5.web.app`
   - Stream Name: "Workshop No. 5 Website"

### Step 2: Get Your Measurement ID

After creating the data stream, you'll see:
- **Measurement ID**: Format `G-XXXXXXXXXX`
- Copy this ID for the next step

### Step 3: Replace Placeholder ID in Code

Replace `G-XXXXXXXXXX` in the following files:

1. **Main Website** (`dist/workshop-no-5/index.html`):
   ```javascript
   // Line ~249 and ~255
   gtag('config', 'G-YOUR-ACTUAL-ID', {
   ```

2. **404 Page** (`dist/workshop-no-5/404.html`):
   ```javascript
   // Line ~54
   gtag('config', 'G-YOUR-ACTUAL-ID', {
   ```

### Step 4: Deploy Changes

```bash
cd c:\git\workshopno5
firebase deploy --only hosting
```

### Step 5: Verify Installation

1. **Real-time Reports**:
   - Go to GA4 > Reports > Real-time
   - Visit your website
   - Should see active users immediately

2. **Debug View**:
   - Install [GA Debugger Chrome Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
   - Enable extension and visit website
   - Check console for event details

## 🎨 Custom Events Already Configured

Your website is ready with these custom events:

### Conversion Events (High Value)
- `consultation_request` - When users click "Schedule Consultation"
- `contact_click` - Phone/email link clicks

### Engagement Events
- `project_click` - Portfolio project interactions
- `navigation_click` - Menu and navigation clicks
- `scroll_depth` - Page scroll engagement (25%, 50%, 75%, 100%)
- `404_error` - Page not found tracking

### Enhanced Measurement (Automatic)
- Page views
- Scrolls  
- Outbound clicks
- Site search
- Video engagement
- File downloads

## 📊 Recommended GA4 Setup

### Create Custom Conversions
1. Go to **Configure > Conversions**
2. Mark these events as conversions:
   - `consultation_request` (Primary conversion)
   - `contact_click` (Secondary conversion)

### Set Up Goals
1. **Primary Goal**: Consultation requests
2. **Secondary Goal**: Contact form interactions
3. **Engagement Goal**: Project portfolio views

### Configure Audiences
Create audiences for:
- **Engaged Visitors**: Users who viewed 3+ projects
- **Potential Clients**: Users who visited contact section
- **Architecture Enthusiasts**: Users with deep scroll engagement

### Custom Reports
Set up reports for:
- **Project Portfolio Performance**: Which projects get most engagement
- **Navigation Effectiveness**: Most used menu items
- **Conversion Funnel**: Home → Portfolio → Contact → Consultation

## 🔒 Privacy & Compliance

Your GA4 setup includes:
- ✅ **Privacy-friendly**: No personally identifiable information tracked
- ✅ **GDPR Compliant**: Event-based tracking without personal data
- ✅ **Cookie Consent**: Ready for cookie consent integration if needed
- ✅ **Data Retention**: Default settings appropriate for business use

## 📈 Success Metrics to Track

### Monthly KPIs
- **Consultation Requests**: Primary business goal
- **Project Engagement**: Portfolio interaction rate
- **Traffic Quality**: Session duration and pages per session
- **Geographic Reach**: Visitor locations (Austin focus)

### Weekly Metrics
- **Popular Projects**: Most viewed residential/commercial projects
- **Navigation Patterns**: User journey through website
- **Contact Engagement**: Email/phone click rates
- **Scroll Depth**: Content engagement levels

## 🚀 Next Steps After GA4 Setup

1. **Test All Events**: Use the Analytics Testing Guide
2. **Set Up Alerts**: Configure email alerts for conversion goals
3. **Create Custom Dashboard**: Focus on architecture business metrics
4. **Integrate with Google Ads**: If running advertising campaigns
5. **Weekly Reporting**: Monitor performance and optimize content

Your Workshop No. 5 website is now ready with professional-grade analytics tracking! 🎉