<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { bookmarks } from 'webextension-polyfill'
import { TreeItem } from './tree-item'
const bookmarkTree = ref<TreeItem[]>([]);

function getBookmarksTree() {
  bookmarks.getTree().then((bookmarkTreeNodes) => {
    bookmarkTree.value = bookmarkTreeNodes.map(node =>
        TreeItem.fromBookmarkNode(node)
    );
  });
  console.log(bookmarkTree.value);
}

onMounted(() => {
  getBookmarksTree()
})
</script>

<template>
  <div>
    <h1>AI Bookmarks Manager</h1>
    <h2>Organize all bookmarks with a single click!</h2>
    <!--    TODO: Tree view vuetifyjs -->
<!--    <ul>-->
<!--      <li v-for="bookmark in bookmarks" :key="bookmark.id">-->
<!--        <a :href="bookmark.url" target="_blank">{{ bookmark.title }}</a>-->
<!--      </li>-->
<!--    </ul>-->
  </div>
</template>
