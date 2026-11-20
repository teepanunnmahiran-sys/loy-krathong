@echo off
chcp 65001 > nul
title นำระบบลอยกระทงออนไลน์ขึ้น GitHub (Push to GitHub)
echo =========================================================================
echo   กำลังนำโค้ดขึ้น GitHub Repository:
echo   https://github.com/teepanunnmahiran-sys/loy-krathong.git
echo =========================================================================
echo.
echo * หมายเหตุ: หากยังไม่ได้สร้าง Repository บน GitHub
echo   กรุณาไปที่ https://github.com/new แล้วตั้งชื่อว่า "loy-krathong" (เลือกแบบ Public)
echo.

git remote remove origin 2>nul
git remote add origin https://github.com/teepanunnmahiran-sys/loy-krathong.git
git branch -M main
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =========================================================================
    echo   [สำเร็จ] นำโค้ดขึ้น GitHub เรียบร้อยแล้ว!
    echo =========================================================================
    echo.
    echo ขั้นตอนเปิดใช้งาน GitHub Pages:
    echo 1. เปิดเว็บ: https://github.com/teepanunnmahiran-sys/loy-krathong/settings/pages
    echo 2. ที่หัวข้อ "Branch" ให้เลือก "main" และเลือก "/ (root)"
    echo 3. กดปุ่ม "Save"
    echo 4. รอประมาณ 1 นาที เว็บจะเปิดให้ทุกคนใช้งานได้ที่:
    echo    https://teepanunnmahiran-sys.github.io/loy-krathong/
    echo =========================================================================
) else (
    echo.
    echo =========================================================================
    echo   [คำแนะนำหากยัง Push ไม่ผ่าน]
    echo   1. ตรวจสอบว่าได้กดสร้าง Repository ชื่อ "loy-krathong" บน GitHub หรือยัง:
    echo      https://github.com/new
    echo   2. หากมีหน้าต่าง Git เด้งขึ้นมาถาม ให้กด "Sign in with your browser"
    echo =========================================================================
)
echo.
pause
