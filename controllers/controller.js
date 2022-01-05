const endpoint = require("../services/endPoints");
const json = require("../services/json");
const userModel = require("../models/user");
const orgsModel = require("../models/orgs");
const reposModel = require("../models/repos");
const collabsModel = require("../models/collabs");

/*** USER ***/

exports.updateUser = async (req, res) => {
  const user = await endpoint.getUser("jcsalinas20");
  userModel.findOneAndUpdate({ type: "user" }, json.user(user), (err, doc) => {
    if (doc) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: true }, null, 2));
    } else {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error 404" }, null, 2));
    }
  });
};

exports.getUser = async (req, res) => {
  userModel.findOne({ type: "user" }, function (err, doc) {
    if (err) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error 404" }, null, 2));
    } else {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ user: doc }, null, 2));
    }
  });
};

/*** ORGANIZATIONS ***/

exports.getOrgs = (req, res) => {
  orgsModel.find({ type: "organization" }, function (err, doc) {
    if (err) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error 404" }, null, 2));
    } else {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ orgs: doc }, null, 2));
    }
  });
};

/*** REPOSITORIES ***/

exports.updateRepos = async (req, res) => {
  let reposStatus = {};
  const repos = await endpoint.getRepos("jcsalinas20");

  for await (const repo of repos) {
    const findDoc = reposModel.findOne(
      { type: "repository", id: repo.id },
      (err, doc) => {
        if (err) {
          return -1;
        } else {
          return doc;
        }
      }
    );

    if (findDoc) {
      if (repo.updated_at > findDoc.updated) {
        const lang = await endpoint.getLang(repo.owner.login, repo.name);
        const releases = await endpoint.getReleases(
          repo.owner.login,
          repo.name
        );

        reposStatus[repo.full_name] = "Updated";
        const updated = await reposModel.updateOne(
          { type: "repository", id: repo.id },
          json.repository(repo, lang, releases)
        );

        if (updated.ok) {
          reposStatus[repo.full_name] = "Updated";
        } else {
          reposStatus[repo.full_name] = "Failed";
        }
      } else {
        reposStatus[repo.full_name] = "No changes";
      }
    } else {
      const lang = await endpoint.getLang(repo.owner.login, repo.name);
      const releases = await endpoint.getReleases(repo.owner.login, repo.name);
      reposModel.create(json.repository(repo, lang, releases));
      reposStatus[repo.full_name] = "Created";
    }
  }

  res.header("Content-Type", "application/json");
  res.send(JSON.stringify(reposStatus, null, 2));
};

exports.getRepos = async (req, res) => {
  reposModel.find({ type: "repository" }, function (err, doc) {
    if (err) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error 404" }, null, 2));
    } else {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ repos: doc }, null, 2));
    }
  });
};

/*** COLLABORATIONS ***/

exports.createCollab = async (req, res) => {
  const collab = await endpoint.getPublicCollabs(req.body.user, req.body.repo);

  collabsModel.findOne(
    { type: "collaboration", id: collab.id },
    async (err, doc) => {
      if (err) {
        res.header("Content-Type", "application/json");
        res.send(JSON.stringify({ status: "Failed" }, null, 2));
      } else {
        if (doc) {
          console.log(doc);
          if (collab.updated_at > doc.updated) {
            const lang = await endpoint.getLang(
              collab.owner.login,
              collab.name
            );
            const releases = await endpoint.getReleases(
              collab.owner.login,
              collab.name
            );
            const contributors = await endpoint.getContributors(
              collab.owner.login,
              collab.name
            );
            const updated = await collabsModel.updateOne(
              { type: "collaboration", id: collab.id },
              json.collaboration(collab, lang, releases, contributors)
            );
            if (updated.ok) {
              res.header("Content-Type", "application/json");
              res.send(JSON.stringify({ status: "Updated" }, null, 2));
            } else {
              res.header("Content-Type", "application/json");
              res.send(JSON.stringify({ status: "Failed" }, null, 2));
            }
          } else {
            res.header("Content-Type", "application/json");
            res.send(JSON.stringify({ status: "No changes" }, null, 2));
          }
        } else {
          const lang = await endpoint.getLang(collab.owner.login, collab.name);
          const releases = await endpoint.getReleases(
            collab.owner.login,
            collab.name
          );
          const contributors = await endpoint.getContributors(
            collab.owner.login,
            collab.name
          );
          collabsModel.create(
            json.collaboration(collab, lang, releases, contributors)
          );
          res.header("Content-Type", "application/json");
          res.send(JSON.stringify({ status: "Created" }, null, 2));
        }
      }
    }
  );
};

exports.getCollabs = (req, res) => {
  collabsModel.find({ type: "collaboration" }, function (err, doc) {
    if (err) {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ status: "Error" }, null, 2));
      return {};
    } else {
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify({ collabs: doc }, null, 2));
      return {};
    }
  });
};

/*** COUNTS ***/
