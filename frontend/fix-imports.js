const fs = require('fs');
const path = require('path');

// 1. Fix EvaluationSubmit import
let evPage = fs.readFileSync('./src/app/(dashboard)/judge/assignments/[id]/page.tsx', 'utf8');
evPage = evPage.replace('import EvaluationSubmit', 'import { EvaluationSubmit }');
fs.writeFileSync('./src/app/(dashboard)/judge/assignments/[id]/page.tsx', evPage);

// 2. Fix ReviewerAssignment import
let revPage = fs.readFileSync('./src/app/(dashboard)/organizer/hackathons/[id]/reviewers/page.tsx', 'utf8');
revPage = revPage.replace('import ReviewerAssignment', 'import { ReviewerAssignment }');
fs.writeFileSync('./src/app/(dashboard)/organizer/hackathons/[id]/reviewers/page.tsx', revPage);

// 3. Fix TeamManager import
let tmPage = fs.readFileSync('./src/app/(dashboard)/organizer/hackathons/[id]/teams/page.tsx', 'utf8');
tmPage = tmPage.replace('import TeamManager', 'import { TeamManager }');
fs.writeFileSync('./src/app/(dashboard)/organizer/hackathons/[id]/teams/page.tsx', tmPage);

// 4. Fix Navbar User import
let navPage = fs.readFileSync('./src/components/layout/Navbar.tsx', 'utf8');
if (!navPage.includes(' User,')) {
  navPage = navPage.replace('UserCircle, LogOut', 'UserCircle, LogOut, User');
  fs.writeFileSync('./src/components/layout/Navbar.tsx', navPage);
}

// 5. Fix old components using api from useAuth
const oldComponents = [
  './src/components/participant/HackathonDetail.tsx',
  './src/components/participant/RegistrationForm.tsx',
  './src/components/participant/TeamCard.tsx'
];

oldComponents.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import\s+\{\s*api\s*\}\s+from\s+['"]\.\.\/\.\.\/hooks\/useAuth['"];/g, 'import { api } from "@/lib/api";');
    fs.writeFileSync(file, content);
  }
});

console.log("All fixes applied.");
