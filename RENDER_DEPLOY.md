# Deploying SwiftInvoice to Render

## Start Command for Render

```
php -S 0.0.0.0:${PORT:-8080}
```

Or use the **Procfile** (Render will auto-detect):

```
web: php -S 0.0.0.0:$PORT
```

## Deployment Steps

1. **Push code to GitHub** ✅ (Already done)

2. **Create Render Account**
   - Go to https://render.com
   - Sign in with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `tamal151947-bit/SwiftInvoice`
   - Select branch: `main`

4. **Configure Service**
   - **Name**: `swiftinvoice`
   - **Runtime**: `PHP`
   - **Build Command**: `php -r "echo 'Building...'"` or leave blank
   - **Start Command**: 
     ```
     php -S 0.0.0.0:${PORT:-8080}
     ```

5. **Environment Variables**
   - Add these under "Environment":
     ```
     DB_HOST: mysql.render.com (or your database host)
     DB_USER: your_db_user
     DB_PASSWORD: your_db_password
     DB_NAME: swiftinvoice_db
     DB_PORT: 3306
     ```

6. **Database Setup**
   - Create MySQL database on Render or use External Database
   - Run init_db.php after deployment:
     ```
     https://your-app.render.com/init_db.php
     ```

7. **Deploy**
   - Click "Create Web Service"
   - Render will auto-deploy from GitHub

## Full Deployment URL

Your app will be available at: `https://swiftinvoice.render.com`

## Important Notes

- ⚠️ **PHP Built-in Server** is suitable for development/testing only
- 🔒 For production, use Render's **PHP with Apache** runtime
- 🗄️ Set up MySQL database (Render MySQL or External)
- 📝 Update `config.php` with environment variables instead of hardcoded values

## Local Testing (Before Deploy)

```powershell
# Install XAMPP or standalone PHP
php -S localhost:8000

# Visit http://localhost:8000/init_db.php to setup database
# Then http://localhost:8000/login.html
```

## Contact Support

If deployment fails:
1. Check Render logs: Dashboard → Web Service → Logs
2. Verify `config.php` database credentials
3. Ensure `init_db.php` runs successfully
