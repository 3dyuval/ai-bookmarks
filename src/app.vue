<script setup lang="ts">
import { ref } from 'vue'
import { bookmarks } from 'webextension-polyfill'
import { TreeItem } from './tree-item'


const bookmarkTree = ref<TreeItem[]>([]);

async function getBookmarksTree() {
  return bookmarks.getTree().then((bookmarkTreeNodes) => {
    return bookmarkTreeNodes.map(node =>
        TreeItem.fromBookmarkNode(node)
    );
  });
}

function onClickOrganize() {
  getBookmarksTree().then(tree => {
    bookmarkTree.value = tree;
  })
}


</script>

<template>
  <div>
    <h1>AI Bookmarks Manager</h1>
    <h2>Organize all bookmarks with a single click!</h2>
    <!--    TODO: Tree view vuetifyjs -->
    <v-btn prepend-icon="star" @click="onClickOrganize">Get bookmarks</v-btn>
    <v-treeview :items="bookmarkTree"/>
  </div>
</template>
