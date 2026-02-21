import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-12-19',
  token: process.env.SANITY_API_EDITOR_TOKEN,
  useCdn: false,
})

const mapping = JSON.parse(
  fs.readFileSync('/tmp/news-images-mapping.json', 'utf-8')
)

async function uploadImageAndLinkToNews(item) {
  const { slug: oldSlug, title: oldTitle, image: imagePath } = item

  // Get Sanity news items
  const results = await client.fetch(
    '*[_type == "news" && (title match $title || title match $slug)] { _id, title, slug }',
    { title: oldTitle.substring(0, 30), slug: oldSlug.substring(0, 30) }
  )

  if (results.length === 0) {
    console.log(`⚠ No match found for: "${oldTitle}"`)
    return null
  }

  const newsItem = results[0]
  
  // Upload image
  console.log(`Uploading ${imagePath}...`)
  const absImagePath = path.join('/root/waves-bot/website', imagePath)
  
  if (!fs.existsSync(absImagePath)) {
    console.log(`  ✗ File not found: ${absImagePath}`)
    return null
  }
  
  const imageBuffer = fs.readFileSync(absImagePath)
  const filename = path.basename(imagePath)
  
  try {
    const imageAsset = await client.assets.upload('image', imageBuffer, {
      filename: filename,
    })
    
    // Update news item with featured image
    await client.patch(newsItem._id)
      .set({
        featuredImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
          alt: newsItem.title,
        },
      })
      .commit()
    
    console.log(`  ✓ Linked to: ${newsItem.title.substring(0, 60)}`)
    return newsItem._id
  } catch (err) {
    console.log(`  ✗ Error uploading: ${err.message}`)
    return null
  }
}

async function main() {
  console.log(`=== MIGRATING ${mapping.length} NEWS IMAGES ===\n`)
  
  let uploaded = 0
  let skipped = 0
  
  for (const item of mapping) {
    const result = await uploadImageAndLinkToNews(item)
    if (result) {
      uploaded++
    } else {
      skipped++
    }
  }
  
  console.log(`\n=== COMPLETE ===`)
  console.log(`Uploaded: ${uploaded}`)
  console.log(`Skipped: ${skipped}`)
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
