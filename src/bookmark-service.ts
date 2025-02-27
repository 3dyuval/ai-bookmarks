import { bookmarks, Bookmarks } from 'webextension-polyfill'
import Dexie, { liveQuery, Table } from 'dexie';
import 'dexie-observable';
import { Observable, merge, distinctUntilChanged } from 'rxjs';
// types.ts
export interface BookmarkNode {
    id: string;
    title: string;
    url?: string;
    parentId?: string;
    children?: BookmarkNode[];
    dateAdded?: number;
    source: 'browser' | 'db' | 'both';
}



export class BookmarkDB extends Dexie {
    bookmarks!: Table<BookmarkNode>;

    constructor() {
        super('BookmarkDatabase');
        this.version(1).stores({
            bookmarks: 'id, url, parentId, dateAdded'
        });
    }

    observeBookmarks() {
        // Local DB changes stream
        const dexieChanges = liveQuery(() => this.getTree());

        // Chrome bookmarks API changes stream
        const chromeChanges = new Observable<BookmarkNode[]>(subscriber => {
            const handleChange = async () => {
                const tree = await bookmarks.getTree();
                subscriber.next(tree);
            };

            // Listen to Chrome bookmarks events
            bookmarks.onCreated.addListener(handleChange);
            bookmarks.onRemoved.addListener(handleChange);
            bookmarks.onChanged.addListener(handleChange);
            bookmarks.onMoved.addListener(handleChange);

            // Initial value
            handleChange();

            // Cleanup
            return () => {
                bookmarks.onCreated.removeListener(handleChange);
                bookmarks.onRemoved.removeListener(handleChange);
                bookmarks.onChanged.removeListener(handleChange);
                bookmarks.onMoved.removeListener(handleChange);
            };
        });

        // Merge both streams
        return merge(dexieChanges, chromeChanges).pipe(
            distinctUntilChanged((prev, curr) =>
                JSON.stringify(prev) === JSON.stringify(curr)
            )
        );
    }


    async getAllBookmarks(): Promise<BookmarkEntry[]> {
        return this.bookmarks.toArray()
    }

    async getBookmark(id: string): Promise<BookmarkEntry | undefined> {
        return this.bookmarks.get(id);
    }

    async storeBookmark(id: string, url?: string) {
        if (!url) return;

        await this.bookmarks.put({
            id,
            url,
            timestamp: new Date()
        });
    }

}
export const db = new BookmarkDB();

export class BookmarkService {
    id: string;
    title: string;
    children?: BookmarkService[];
    url?: string;

    constructor(data: Partial<BookmarkService>) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.children = data.children;
        this.url = data.url;
    }

    get faviconUrl() {
        if (this.url) {
            return `https://www.google.com/s2/favicons?domain=${this.url}`;
        }
        return ''
    }

    static async fromBookmarkNode(node: Bookmarks.BookmarkTreeNode, parentId?: string): Promise<BookmarkService> {
        // Store in DB with parent reference
        await db.storeBookmark(node, parentId);

        // Process children recursively
        const children = node.children
            ? await Promise.all(node.children.map(child =>
                BookmarkService.fromBookmarkNode(child, node.id)
            ))
            : undefined;

        return new BookmarkService({
            id: node.id,
            title: node.title + (node.url ? ' : bookmark' : ' :'),
            url: node.url,
            children
        });
    }

    resolveTree(bookmarks: BookmarkEntry[]): BookmarkService[] {
        // Create a map for quick lookup
        const itemMap = new Map<string, BookmarkEntry>();
        bookmarks.forEach(b => itemMap.set(b.id, b));

        // Group by parent
        const childrenMap = new Map<string | undefined, BookmarkEntry[]>();
        bookmarks.forEach(bookmark => {
            const parentItems = childrenMap.get(bookmark.parentId) || [];
            parentItems.push(bookmark);
            childrenMap.set(bookmark.parentId, parentItems);
        });

        // Recursive function to build tree
        function buildTreeItem(entry: BookmarkEntry): BookmarkService {
            const children = childrenMap.get(entry.id);
            return new BookmarkService({
                id: entry.id,
                title: entry.title + (entry.url ? ' : bookmark' : ' :'),
                url: entry.url,
                children: children?.map(buildTreeItem)
            });
        }

        // Start with root items (no parentId)
        const rootItems = childrenMap.get(undefined) || [];
        return rootItems.map(buildTreeItem);
    }


    // Convert back to BookmarkTreeNode format
    toBookmarkNode(): Bookmarks.BookmarkTreeNode {
        const node: Partial<Bookmarks.BookmarkTreeNode> = {
            id: this.id,
            title: this.title.replace(/ : .*$/, ''), // Remove our added suffixes
            url: this.url
        };

        if (this.children) {
            node.children = this.children.map(child => child.toBookmarkNode());
        }

        return node as Bookmarks.BookmarkTreeNode;
    }

    // Clone for previewing changes
    clone(): BookmarkService {
        return new BookmarkService({
            id: this.id,
            title: this.title,
            url: this.url,
            children: this.children?.map(child => child.clone())
        });
    }

    // Helper methods for manipulating the tree
    findById(id: string): BookmarkService | null {
        if (this.id === id) return this;
        if (!this.children) return null;

        for (const child of this.children) {
            const found = child.findById(id);
            if (found) return found;
        }

        return null;
    }

    getPath(): string {
        // Implementation to get full path
        return this.title;
    }

    deleteFromBookmarks() {
        bookmarks.remove(this.id);
    }

}
