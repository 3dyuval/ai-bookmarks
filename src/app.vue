<script setup lang="ts">
import { onMounted, ref } from 'vue'
import browser, { Bookmarks } from 'webextension-polyfill'


type Bookmark = {
  id: string
  title: string
  url: string
}

const bookmarks = ref < Array<Bookmarks.BookmarkTreeNode>>([])

function getBookmarks() {
  browser.bookmarks.getTree().then((bookmarkTreeNodes) => {
    const flattenBookmarks = (nodes) => {
      return nodes.reduce((acc: any[], node) => {
        if (node.url) {
          acc.push(node)
        }
        if (node.children) {
          acc.push(...flattenBookmarks(node.children))
        }
        return acc
      }, [] as Array<Bookmark>)
    }
    bookmarks.value = flattenBookmarks(bookmarkTreeNodes)
  })
}

onMounted(() => {
  getBookmarks()
})
</script>

<template>
  <div>
    <h1>My Chrome Extension</h1>
    <h2>Bookmarks</h2>
    <ul>
      <li v-for="bookmark in bookmarks" :key="bookmark.id">
        <a :href="bookmark.url" target="_blank">{{ bookmark.title }}</a>
      </li>
    </ul>
  </div>
</template>
