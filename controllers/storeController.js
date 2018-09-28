const mongoose = require('mongoose');
const Store = mongoose.model('Store');
// multiple form upload types
const multer = require('multer');
// middleware for photo manipulation
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: (req, file, next) => {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: `That file isn't allowed` }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once it is written to disc, move on!
  next();
};

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // query the db for a list of all stores
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
};

exports.editStore = async (req, res) => {
  // 1. find the store given the id
  const store = await Store.findOne({ _id: req.params.id });
  
  // 2. confirm they are the owner of the store
  // TODO
  
  // 3. render the edit form so user can update
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // set the location data to be a point
  // TODO: come back to this if problems arise...
  req.body.location.type = 'Point';
  // console.log(req);
  // find and upgate the store
  const store = await Store.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { 
      new: true, // return the new store instead of the old
      runValidators: true
    }
  ).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store.</a>`);
  res.redirect(`/stores/${store._id}/edit`);
  
  // redirect the store and confirm
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  if (!store) return next();
  // res.json(store);
  res.render('store', { store, title: store.name });
}

exports.getStoresByTag = async (req, res, next) => {
  const tag = req.params.tag;
  // tag query is the tag, but if its empty then the query is any store with the tag property on it
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery })
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tag', { tags, tag, stores, title: 'Tags' });
}