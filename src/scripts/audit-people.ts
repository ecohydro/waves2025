#!/usr/bin/env tsx

/**
 * People profile completeness audit script
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2023-12-19',
  useCdn: false,
});

async function auditPeopleProfiles() {
  console.log('📊 PEOPLE PROFILE DATA COMPLETENESS AUDIT');
  console.log('='.repeat(50));

  const people = await client.fetch(`
    *[_type == "person"] {
      _id,
      name,
      slug,
      title,
      userGroup,
      avatar,
      email,
      website,
      socialMedia,
      researchInterests,
      bio,
      joinDate,
      isActive
    }
  `);

  console.log(`Total people: ${people.length}`);
  
  const issues = {
    missingEmails: people.filter(p => p.userGroup === 'current' && !p.email).length,
    missingAvatars: people.filter(p => !p.avatar?.asset?._ref).length,
    missingBios: people.filter(p => p.userGroup === 'current' && !p.bio).length,
    missingTitles: people.filter(p => p.userGroup === 'current' && !p.title).length,
    missingResearchInterests: people.filter(p => p.userGroup === 'current' && (!p.researchInterests || p.researchInterests.length === 0)).length,
    missingSlugs: people.filter(p => !p.slug?.current).length,
  };

  console.log(`\nData Completeness Issues:`);
  console.log(`• Missing emails (current): ${issues.missingEmails}`);
  console.log(`• Missing avatars (all): ${issues.missingAvatars}`);
  console.log(`• Missing bios (current): ${issues.missingBios}`);
  console.log(`• Missing titles (current): ${issues.missingTitles}`);
  console.log(`• Missing research interests (current): ${issues.missingResearchInterests}`);
  console.log(`• Missing slugs (all): ${issues.missingSlugs}`);

  const currentMembers = people.filter(p => p.userGroup === 'current');
  const alumni = people.filter(p => p.userGroup === 'alumni');
  
  console.log(`\nGroup Distribution:`);
  console.log(`• Current members: ${currentMembers.length}`);
  console.log(`• Alumni: ${alumni.length}`);
  console.log(`• Other: ${people.length - currentMembers.length - alumni.length}`);

  if (issues.missingEmails > 0) {
    console.log(`\n❌ Current members missing emails:`);
    people.filter(p => p.userGroup === 'current' && !p.email)
          .forEach(p => console.log(`   • ${p.name}`));
  }

  if (issues.missingAvatars > 0) {
    console.log(`\n❌ People missing avatars (first 10):`);
    people.filter(p => !p.avatar?.asset?._ref)
          .slice(0, 10)
          .forEach(p => console.log(`   • ${p.name} (${p.userGroup})`));
  }

  // Calculate completeness score
  const totalCurrentMembers = currentMembers.length;
  const completeProfiles = currentMembers.filter(p => 
    p.email && p.title && p.bio && p.researchInterests?.length > 0 && p.avatar?.asset?._ref
  ).length;
  
  const completenessScore = totalCurrentMembers > 0 
    ? Math.round((completeProfiles / totalCurrentMembers) * 100)
    : 0;

  console.log(`\n📈 Profile Completeness Score: ${completenessScore}% (${completeProfiles}/${totalCurrentMembers} current members have complete profiles)`);

  return {
    totalPeople: people.length,
    currentMembers: currentMembers.length,
    alumni: alumni.length,
    issues,
    completenessScore,
    completeProfiles,
  };
}

async function main() {
  try {
    await auditPeopleProfiles();
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}