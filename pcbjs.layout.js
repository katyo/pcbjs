define(['nls!.'], function(t){
  return {
    /*
     * Layers configuration
     *
     * Gerber file extensions
     * Kicad/Protel | Eagle | Orcad
     */
    /* copper */
    wire_top: {
      title: t("Copper Top"),
      color: 'brown',
      hatch: 1,
      index: 10,
      files: /\.(?:gtl|cmp|top)$/i
    },
    wire_bot: {
      title: t("Copper Bottom"),
      color: 'green',
      hatch: 1,
      index: -10,
      files: /\.(?:gbl|sol|bot)$/i
    },
    /*wire_in$1: {
      title: t("Copper Inner"),
      files: /\.g([0-9])$/i
    },*/
    /* solder mask */
    mask_top: {
      title: t("Mask Top"),
      color: 'pink',
      index: 11,
      files: /\.(?:gts|stc|smt|stoptop|tsm)$/i
    },
    mask_bot: {
      title: t("Mask Bottom"),
      color: 'blue',
      index: -11,
      files: /\.(?:gbs|sts|smb|stopbot|bsm)$/i
    },
    /* silk overlay */
    silk_top: {
      title: t("Silk Top"),
      color: 'while',
      index: 12,
      files: /\.(?:gto|plc|sst|positop|slk|leg)$/i
    },
    silk_bot: {
      title: t("Silk Bottom"),
      color: 'cian',
      index: -12,
      files: /\.(?:gbo|pls|ssb|posibot|bsk)$/i
    },
    /* drill */
    hole: {
      title: t("Drill map"),
      color: 'red',
      index: 0,
      files: /\.(?:drl|drd|tap|txt|gdd|cnc|exl|drill)$/i
    },
    /* edges */
    edge: {
      title: t("Edges/Outline"),
      color: 'yellow',
      index: 0,
      files: /\.(?:gbr|gko|gm[12])$/i
    },
    /* stencil */
    /*
    sold_top: {
      title: t("Sold Top"),
      color: 'black',
      files: /\.(?:gtp)$/i
    },
    sold_bot: {
      title: t("Sold Bottom"),
      color: 'gray',
      files: /\.(?:gbp)$/i
    },*//*,
    padm: { // pad master
      top: /\.(?:gpb)$/i,
      bot: /\.(?:gpt)$/i
    },*/
    none: {
      title: t("Unknown"),
      color: 'white',
      files: /$/i
    }
  };
});
