import browser, { Bookmarks } from 'webextension-polyfill'


export class TreeItem {
    id: string;
    title: string;
    children?: TreeItem[];
    url?: string;

    constructor(data: Partial<TreeItem>) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.children = data.children;
        this.url = data.url;
    }

    // Convert from browser BookmarkTreeNode to our TreeItem
    static fromBookmarkNode(node: Bookmarks.BookmarkTreeNode): TreeItem {
        return new TreeItem({
            id: node.id,
            title: node.title + (node.url ? ' : bookmark' : ' :'),
            url: node.url,
            children: node.children?.map(child => TreeItem.fromBookmarkNode(child))
        });
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
    clone(): TreeItem {
        return new TreeItem({
            id: this.id,
            title: this.title,
            url: this.url,
            children: this.children?.map(child => child.clone())
        });
    }

    // Helper methods for manipulating the tree
    findById(id: string): TreeItem | null {
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
}

