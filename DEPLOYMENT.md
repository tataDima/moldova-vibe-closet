# VPS Deployment Guide (Hostinger)

## Prerequisites
- VPS with web server (Nginx or Apache)
- Node.js installed on your local machine
- SSH access to your VPS

## Build the Application

```bash
npm run build
```

This creates a `dist` folder with all production files.

## For Apache (Most Common on Shared Hosting)

The `.htaccess` file is already included in the `public` folder and will be copied to `dist` during build.

### Deploy Steps:
1. Build your app: `npm run build`
2. Upload the entire `dist` folder contents to your web root (usually `/public_html` or `/var/www/html`)
3. The `.htaccess` file will handle all routing automatically

### If .htaccess doesn't work:
Enable mod_rewrite on your server:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## For Nginx

### Deploy Steps:
1. Build your app: `npm run build`
2. Upload the `dist` folder contents to your web root
3. Update your Nginx configuration (usually in `/etc/nginx/sites-available/default`):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

4. Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Quick Deploy Script

You can use this one-liner to deploy (replace with your VPS details):

```bash
npm run build && scp -r dist/* user@your-vps-ip:/var/www/html/
```

## Verify Deployment

1. Visit your domain
2. Navigate to any route (e.g., `/category/dresses`)
3. Refresh the page - it should load correctly without 404

## Troubleshooting

If you still get 404 errors after deployment:

**For Apache:**
- Ensure `.htaccess` file is in the web root
- Check if `AllowOverride All` is set in Apache config
- Verify mod_rewrite is enabled

**For Nginx:**
- Check Nginx error logs: `sudo tail -f /var/nginx/error.log`
- Verify the `try_files` directive is in your config
- Make sure you reloaded Nginx after config changes

