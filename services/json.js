module.exports = {
  user: (user) => {
    return {
      username: user.login,
      avatar: user.avatar_url,
      blog: user.blog,
      company: user.company,
      email: user.email,
      followers: user.followers,
      location: user.location,
      name: user.name,
      public_repos: user.public_repos,
      twitter: user.twitter_username,
      url: user.html_url,
    };
  },

  releases: (releases) => {
    let rels = [];
    for (const release of releases) {
      let rel = {
        owner: release.author.login,
        name: release.name,
        body: release.body,
        tagname: release.tag_name,
        url: release.html_url,
        draft: release.draft,
        published: release.published_at,
        src_zip_url: release.zipball_url,
        assets: [],
      };
      for (const asset of release.assets) {
        rel.assets.push({
          name: asset.name,
          size: asset.size,
          download_count: asset.download_count,
          download_url: asset.browser_download_url,
        });
      }
      rels.push(rel);
    }
    return rels;
  },

  collaboration: (collaboration, lang, releases, contributors) => {
    return {
      id: collaboration.id,
      owner: collaboration.owner.login,
      name: collaboration.name,
      url: collaboration.html_url,
      description: collaboration.description,
      stars: collaboration.stargazers_count,
      archived: collaboration.archived,
      type: "collaboration",
      languages: lang,
      contributors: contributors,
      topics: collaboration.topics,
      releases: releases,
      updated: collaboration.updated_at,
    };
  },
};