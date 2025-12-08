# Analytics Testing Guide for Workshop No. 5

## 🎯 Live Website: https://workshopno5.web.app

## Analytics Events to Test

### 1. **Navigation Tracking Events**
Test these by clicking/interacting with navigation elements:

- `logo_home` - Click Workshop No. 5 logo
- `portfolio_residential` - Click Residential in dropdown
- `portfolio_commercial` - Click Commercial in dropdown  
- `services` - Click Services link
- `about` - Click About link
- `contact_desktop` - Click Contact Us button (desktop)
- `hero_cta` - Click "View Our Work" button in hero section

### 2. **Project Interaction Events**
Test by clicking on portfolio items:

- `project_click` with `residential` type - Click any residential project card
- `project_click` with `commercial` type - Click any commercial project card
- Each click captures the project name as event label

### 3. **Contact & Conversion Events**
Test these interaction points:

- `contact_click` with `phone` - Click phone number link
- `contact_click` with `email` - Click email link
- `consultation_request` with `general` - Click "Schedule Consultation" button

### 4. **Engagement Tracking Events**
These trigger automatically:

- `scroll_depth` at 25%, 50%, 75%, 100% - Scroll down the page
- `page_view` - Automatic on page load
- `404_error` - Visit a non-existent page (e.g., /test-404)

## 🧪 How to Test Analytics

### Method 1: Real-time Reports (Recommended)
1. Go to [Google Analytics](https://analytics.google.com/)
2. Navigate to **Reports > Real-time**
3. Open https://workshopno5.web.app in another tab
4. Perform the actions listed above
5. Watch events appear in real-time

### Method 2: Browser Developer Tools
1. Open https://workshopno5.web.app
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Perform actions and watch for `gtag` calls
5. Events should show in console (if debug mode enabled)

### Method 3: GA4 Debug View
1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) extension
2. Enable the extension
3. Visit https://workshopno5.web.app
4. All events will show in console with detailed information

## 📊 Expected Event Structure

### Navigation Events
```javascript
gtag('event', 'navigation_click', {
  event_category: 'navigation',
  event_label: 'portfolio_residential', // varies by action
  value: 1
});
```

### Project Click Events
```javascript
gtag('event', 'project_click', {
  event_category: 'engagement', 
  event_label: '4205 Venado', // project name
  custom_parameter_1: 'residential', // project type
  value: 1
});
```

### Contact Events
```javascript
gtag('event', 'consultation_request', {
  event_category: 'conversion',
  event_label: 'general',
  value: 20 // high value for conversions
});
```

### Scroll Depth Events
```javascript
gtag('event', 'scroll_depth', {
  event_category: 'engagement',
  event_label: '50%', // percentage scrolled
  value: 50
});
```

## 🔧 Custom Dimensions & Metrics

The analytics setup includes:
- **Project Type** (`custom_parameter_1`) - residential/commercial
- **Event Values** - Weighted by importance (navigation=1, contact=5, consultation=20)
- **Enhanced Measurement** - Automatic page views, scrolls, outbound links

## 📈 Analytics Goals to Monitor

### High-Value Events:
1. **Consultation Requests** (value: 20) - Primary conversion goal
2. **Contact Clicks** (value: 5) - Secondary conversion goal  
3. **Project Clicks** (value: 1) - Engagement goal
4. **Deep Scroll** (75-100%) - Engagement goal

### Performance Metrics:
- Page load speed
- Bounce rate
- Session duration
- Pages per session

## ⚠️ Important Notes

1. **Replace Measurement ID**: Update `G-XXXXXXXXXX` with actual GA4 ID
2. **Data Delay**: Real-time shows immediately, standard reports take 24-48 hours
3. **Testing Mode**: Use GA4 Debug View for detailed testing
4. **Custom Events**: All events follow GA4 recommended naming conventions

## 🎉 What's Working

✅ **Functional Website**: Modern, responsive design with Bootstrap 5  
✅ **Dynamic Portfolio**: Loads projects from JSON data files  
✅ **Complete Analytics**: Comprehensive event tracking implemented  
✅ **SEO Optimized**: Sitemap, robots.txt, meta tags configured  
✅ **Error Handling**: Custom 404 page with analytics  
✅ **Firebase Hosting**: Fast, secure hosting with SSL  

Visit **https://workshopno5.web.app** to see the live website! 🚀