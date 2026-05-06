# 🚀 دليل رفع المشروع على GitHub — أول مرة

## الخطوات كاملة في الـ Terminal

```bash
# ════════════════════════════════════════════════════════════
# الخطوة 1: تهيئة Git في مجلد المشروع
# ════════════════════════════════════════════════════════════

cd nexus-netplay-hub
git init
git branch -M main

# ════════════════════════════════════════════════════════════
# الخطوة 2: إعداد هوية Git (مرة واحدة فقط على جهازك)
# ════════════════════════════════════════════════════════════

git config user.name  "اسمك"
git config user.email "بريدك@example.com"

# ════════════════════════════════════════════════════════════
# الخطوة 3: إنشاء الريبو على GitHub
# ════════════════════════════════════════════════════════════
# افتح: https://github.com/new
# اسم الريبو: nexus-netplay-hub
# الوضع: Public ✅
# لا تضيف README أو .gitignore (عندنا منهم)
# اضغط "Create repository"

# ════════════════════════════════════════════════════════════
# الخطوة 4: ربط المشروع بـ GitHub
# ════════════════════════════════════════════════════════════

git remote add origin https://github.com/YOUR_USERNAME/nexus-netplay-hub.git

# تحقق أن الربط صح:
git remote -v
# origin  https://github.com/YOUR_USERNAME/nexus-netplay-hub.git (fetch)
# origin  https://github.com/YOUR_USERNAME/nexus-netplay-hub.git (push)

# ════════════════════════════════════════════════════════════
# الخطوة 5: أضف الملفات وارفعها
# ════════════════════════════════════════════════════════════

# تحقق من الملفات التي ستُرفع (تأكد لا يوجد node_modules)
git status

# أضف كل الملفات
git add .

# تحقق مرة ثانية
git status
# يجب أن ترى الملفات الصحيحة فقط

# Commit أول
git commit -m "🎮 Initial commit: Nexus Netplay Hub v1.0.0

- Electron + React + Tailwind UI
- P2P WebRTC via Simple-Peer
- Config Injection for PCSX2, Dolphin, PPSSPP
- Voice Chat via WebRTC MediaStream
- Frame Sync Algorithm for Save States
- UPnP auto port mapping
- Auto-updater via electron-updater
- GitHub Actions CI/CD"

# ارفع على GitHub
git push -u origin main

# ════════════════════════════════════════════════════════════
# الخطوة 6: إضافة GitHub Token كـ Secret
# ════════════════════════════════════════════════════════════
# 1. اذهب إلى الريبو على GitHub
# 2. Settings → Secrets and variables → Actions
# 3. New repository secret
# 4. Name:  GH_TOKEN
# 5. Value: ghp_xxxxxxxxxxxx  (الـ Token الذي أنشأته)
# 6. Add secret ✅

# ════════════════════════════════════════════════════════════
# الخطوة 7: إصدار أول Release (v1.0.0)
# ════════════════════════════════════════════════════════════

# تأكد أن كل شيء مرفوع
git status   # يجب أن يقول "nothing to commit"

# أنشئ Tag
git tag -a v1.0.0 -m "🎮 Nexus Netplay Hub v1.0.0 — الإصدار الأول"

# ارفع الـ Tag — هذا يُفعّل GitHub Actions تلقائياً!
git push origin v1.0.0

# ════════════════════════════════════════════════════════════
# الخطوة 8: تابع البناء
# ════════════════════════════════════════════════════════════
# اذهب إلى: https://github.com/YOUR_USERNAME/nexus-netplay-hub/actions
# ستجد Workflow يعمل على 3 منصات
# انتظر ~15 دقيقة حتى يكتمل

# بعد الاكتمال:
# اذهب إلى: https://github.com/YOUR_USERNAME/nexus-netplay-hub/releases
# ستجد Draft Release جاهز بكل الملفات
# راجعه ثم اضغط "Publish release" ✅

# ════════════════════════════════════════════════════════════
# إصدارات مستقبلية (سريع جداً)
# ════════════════════════════════════════════════════════════

# بعد أي تعديلات:
git add .
git commit -m "✨ feat: إضافة دعم RPCS3"
git push origin main

# رفع إصدار جديد:
npm version patch        # 1.0.0 → 1.0.1 (إصلاح أخطاء)
npm version minor        # 1.0.0 → 1.1.0 (ميزة جديدة)
npm version major        # 1.0.0 → 2.0.0 (تغيير كبير)
git push origin main --follow-tags   # يرفع الكود + الـ Tag معاً

# ════════════════════════════════════════════════════════════
# أوامر Git المفيدة يومياً
# ════════════════════════════════════════════════════════════

git log --oneline -10           # آخر 10 commits
git diff                        # ما الذي تغيّر؟
git stash                       # احفظ تغييراتك مؤقتاً
git stash pop                   # استرجعها
git branch feature/new-thing    # branch جديد
git checkout feature/new-thing  # انتقل إليه
git merge feature/new-thing     # دمجه في main
```
