const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
  // query the db for a list of all stores
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
}

exports.editStore = async (req, res) => {
  // find the store given the id
  const store = await Store.findOne({ _id: req.params.id });
  
  // confirm they are the owner of the store
  // TODO
  
  // render the edit form so user can update
  res.render('editStore', { title: `Edit ${store.name}`, store });
}

exports.updateStore = async (req, res) => {
  // find and upgate the store
  const store = await Store.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { 
      new: true, // return the new store instead of the old
      runValidators: true
    }).exec();
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store.</a>`);
    res.redirect(`/stores/${store._id}/edit`);
    
  // redirect the store and confirm
}