import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<Layout title={post.data.title}>
  <article class="max-w-3xl mx-auto">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-4">{post.data.title}</h1>
      <div class="flex items-center gap-4 text-gray-600">
        <time datetime={post.data.date}>
          {new Date(post.data.date).toLocaleDateString('es-ES')}
        </time>
        <div class="flex gap-2">
          {post.data.tags.map((tag) => (
            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </header>
    
    <div class="prose prose-lg max-w-none">
      <Content />
    </div>
  </article>
</Layout>