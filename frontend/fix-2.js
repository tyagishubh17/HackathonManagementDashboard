const fs = require('fs');

// Fix ReviewerAssignment
let revPage = fs.readFileSync('./src/app/(dashboard)/organizer/hackathons/[id]/reviewers/page.tsx', 'utf8');
revPage = revPage.replace('<ReviewerAssignment hackathonId={id as string} />', '<ReviewerAssignment hackathonId={id as string} onRefresh={() => {}} />');
fs.writeFileSync('./src/app/(dashboard)/organizer/hackathons/[id]/reviewers/page.tsx', revPage);

// Fix other components
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
