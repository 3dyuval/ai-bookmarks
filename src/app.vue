<script setup lang="ts">
import { ref } from 'vue'
import { useObservable } from '@vueuse/rxjs'
import { BookmarkService, BookmarkNode, db } from './bookmark-service'
import 'dexie-observable';
import { useLastChanged, useTimeAgo } from "@vueuse/core";

const bookmarks = useObservable(db.observeBookmarks());
const changed = useLastChanged(bookmarks)
const timeAgo = useTimeAgo(changed)
</script>

<template>
  <div class="popup flex-column pa-4">
    <div class="tree-content">
      <v-treeview
          :items="bookmarks"
          activatable
          open-on-click
      >
        <template #prepend="{ item }">
          <v-icon>
            {{ item.url ? 'mdi-bookmark' : 'mdi-folder' }}
          </v-icon>
        </template>
        <template #item="{ item, props }">
          <v-list-item v-bind="props">
            <template #title>
              {{ item.title }}
              <v-chip
                  size="x-small"
                  class="ml-2"
              >
                {{ item.source }}
              </v-chip>
            </template>
          </v-list-item>
        </template>
      </v-treeview>
    </div>
  </div>
</template>
