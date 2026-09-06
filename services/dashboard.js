// Counts for the panel's Dashboard tiles. Reuses the same in-memory
// global.tblX arrays every corresponding "/admin/X/all" list page already
// reads from (see utilities/fetchAllData.js) -- so a tile's count always
// matches what that page's own list shows, and no extra DB round-trip is
// needed for something that used to require fetching all 6 full tables.
const getDashboardCountsService = async () => {
  return {
    news: global.tblNews?.length ?? 0,
    banners: global.tblBanner?.length ?? 0,
    users: global.tblUsers?.length ?? 0,
    pages: global.tblPages?.length ?? 0,
    photoLibrary: global.tblPhotoLibrary?.length ?? 0,
    videoLibrary: global.tblVideoLibrary?.length ?? 0,
  };
};

module.exports = {
  getDashboardCountsService,
};
