import NodeCache from "node-cache";

const cache = new NodeCache({
    stdTTL: 3600, // Cache expires after 1 hour (3600 seconds)
    checkperiod: 600,  // Check for expired keys every 10 minutes
    useClones: false  // Faster, since we don't mutate results
});


export const clearArchiveCache = () => {
  cache.keys().forEach(key => {
    if (key.startsWith('archive_items:') || key.startsWith('archive_item:')) {
      cache.del(key);
    }
  });
};

export const clearCollectionsCache = () => {
  cache.keys().forEach(key => {
    if (key.startsWith('collections:') || key.startsWith('collection:')) {
      cache.del(key);
    }
  });
};

export default cache;

