
const Rsvp = require('./Rsvp');

module.exports = (function rsvpController() {

  function index(req, res, next) {
    const { title = 'No City Selected', city, cafes } = ((req.session || {}).context || {});
    const yelpIds = (cafes || []).map(cafe => ({ yelpId: cafe.id }));

    if (!(yelpIds.length)) {
      return res.render('index', { title, city, user: req.user });
    }

    return Rsvp
      .aggregate([
        {
          $match: { $or: yelpIds },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user_doc',
          },
        },
        {
          $group: {
            _id: '$yelpId',
            users: {
              $push: {
                userId: '$user_doc._id',
                username: '$user_doc.username',
              },
            },
          },
        },
      ]).exec()
      .then((docs) => {
        const cafesRsvps = cafes.map((cafe) => {
          let rsvps = [];
          docs.some((doc) => {

            if (cafe.id === doc._id) {
              rsvps = doc.users;
              return true;
            }
            return false;
          });

          const rsvpUsers = rsvps.reduce((acc, el) => {
            acc.userIds.push(el.userId[0].toString());
            acc.usernames.push(el.username[0]);
            return acc;
          }, { userIds: [], usernames: [] });
          console.log(rsvpUsers);
          return ({ id: cafe.id, name: cafe.name, rsvpUsers });
        });
        res.render('index', { title, city, cafes: cafesRsvps, user: req.user });
      })
      .catch((err) => {
        console.error('Rsvp find error');
        next(err);
      });
  }

  function create(req, res, next) {
    const userId = req.user.id;
    const yelpId = req.query.yelpId;
    const newRsvp = { yelpId, userId };

    if (req.user) {
      Rsvp.findOne(newRsvp).exec()
        .then((foundRsvp) => {
          if (foundRsvp) {
            console.log('rsvp create: already have one');
            res.redirect('/');
          } else {
            Rsvp.create(newRsvp)
              .then((rsvp) => {
                console.log('created new Rsvp');
                console.log(rsvp);
                res.redirect('/');
              })
              .catch((err) => {
                console.log('Err Rsvp create');
                console.log(newRsvp);
                next(err);
              });
          }
        })
        .catch((err) => {
          console.log('Err Rsvp find');
          console.log(newRsvp);
          next(err);
        });
    } else {
      res.redirect('/login');
    }
  }

  function remove(req, res, next) {
    const doc = {
      yelpId: req.query.yelpId,
      userId: (req.user || {}).id,
    };

    console.log('Attempt to delete ', doc);
    Rsvp.deleteMany(doc)
      .then(() => {
        console.log('Deleted', doc);
        res.redirect('/');
      })
      .catch(next);
  }

  return {
    index,
    create,
    remove,
  };
}());
