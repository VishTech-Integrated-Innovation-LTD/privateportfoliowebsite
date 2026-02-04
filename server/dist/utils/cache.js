"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCollectionsCache = exports.clearArchiveCache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({
    stdTTL: 3600, // Cache expires after 1 hour (3600 seconds)
    checkperiod: 600, // Check for expired keys every 10 minutes
    useClones: false // Faster, since we don't mutate results
});
const clearArchiveCache = () => {
    cache.keys().forEach(key => {
        if (key.startsWith('archive_items:') || key.startsWith('archive_item:')) {
            cache.del(key);
        }
    });
};
exports.clearArchiveCache = clearArchiveCache;
const clearCollectionsCache = () => {
    cache.keys().forEach(key => {
        if (key.startsWith('collections:') || key.startsWith('collection:')) {
            cache.del(key);
        }
    });
};
exports.clearCollectionsCache = clearCollectionsCache;
exports.default = cache;
