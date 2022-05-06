const path = require('path')

const NODE_MANIFEST_COUNT = 10

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }) => {
  const { createNode, unstable_createNodeManifest } = actions

  let i = 0
  while (i < NODE_MANIFEST_COUNT) {
    console.log(`creating node manifest: ${i}`)

    const nodeId = createNodeId(`fake-node-${i}`)

    await createNode({
      id: nodeId,
      internal: {
        contentDigest: createContentDigest(`content-digest-for-node-${i}`),
        type: `HugeNodeManifestField`,
      }
    })

    unstable_createNodeManifest({

      manifestId: `fake-one-${i}`,
      updatedAtUTC: new Date().toUTCString(),
      node: {
        id: nodeId,
      },
      plugin: {
        name: `gatsby-source-your-mom`,
      },
    })

    i++
  }
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Define a template for blog post
  const blogPost = path.resolve('./src/templates/blog-post.js')

  const result = await graphql(
    `
      {
        allContentfulBlogPost {
          nodes {
            title
            slug
          }
        }
      }
    `
  )

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your Contentful posts`,
      result.errors
    )
    return
  }

  const posts = result.data.allContentfulBlogPost.nodes

  // Create blog posts pages
  // But only if there's at least one blog post found in Contentful
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostSlug = index === 0 ? null : posts[index - 1].slug
      const nextPostSlug =
        index === posts.length - 1 ? null : posts[index + 1].slug

      createPage({
        path: `/blog/${post.slug}/`,
        component: blogPost,
        context: {
          slug: post.slug,
          previousPostSlug,
          nextPostSlug,
        },
      })
    })
  }
}

exports.onPostBuild = ({ store }) => {
  console.log(`onPostBuild store value`, store.getState().telemetry)
}

