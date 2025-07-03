# Metazooa Head-to-Head: Elinor vs Yasha

A simple, zero-setup web app for tracking your daily Metazooa results and friendly rivalry stats between Elinor and Yasha.

---

![App Screenshot](ui_screenshot.png)

---

## Features

- **Paste daily Metazooa results** for both players (side-by-side input).
- **Winner auto-calculated:**  
  - If only one solves, that player wins  
  - If both solve, lower number of guesses wins  
  - If tied, it’s a tie  
  - If both stumped, it’s a tie  
- **Graphical stats dashboard:**  
  - Win % (pie chart)  
  - Solve Rate (bar chart)  
  - Average number of guesses (bar chart)
- **Full results history** table, including winner and reason for each day.
- **Edit and delete** any previous entry directly in the browser.
- **Export/Import CSV** to back up or restore all data, or to use with Google Sheets/Excel.
- **All data is private and stays in your browser** (using localStorage).
- **No server or sign-in required.**

---

## How To Use

1. **Open `metazooa-head2head.html` in your web browser** (double-click, or right-click and open with Chrome/Firefox/Edge/Safari).
2. **Paste your Metazooa result** in the Elinor or Yasha box, and click **“Add Today’s Result.”**
3. **See stats and history** update automatically.
4. To **edit or delete** a past entry, use the links in the Results History table.
5. To **back up or share data**, use **Export CSV** to save your history, and **Import CSV** to restore it (or load it on another device/browser).
6. **Data persists automatically** as long as you use the same browser and don’t clear site data.

> **Tip:** For extra peace of mind, occasionally export your CSV and keep it in the same folder.

---

## Limitations & Notes

- Works best for two players (Elinor and Yasha).
- The app cannot automatically import your CSV without you selecting it (browser security).
- If you clear browser data, you’ll lose your history unless you have exported it as CSV.
- The HTML and CSV files can be kept together in a git repo for easy versioning and backup.

---

### Example Files in Repo

- `metazooa-head2head.html` — The app (open in browser)
- `metazooa_elinor_yasha.csv` — Your backup/exported results (can import into the app)
- `ui_screenshot.png` — Screenshot of the app UI

---

## Future Improvements (Ideas)

- Add more stats or charts
- Auto-backup reminders or download
- Support for more than two players
- Online hosting

---

**Enjoy your Metazooa rivalry!**
