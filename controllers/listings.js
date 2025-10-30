const Listing = require("../models/listing");

module.exports.index = async (req,res)=>{
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res)=>{
  res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res)=>{
  const {id} = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path : "reviews",
      populate: {
        path : "author",
      },
    })
    .populate("owner");
  if(!listing){
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req,res, next)=>{
  
  try{
   const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${req.body.listing.location}&format=json&addressdetails=1&limit=1`,    {
      headers: {
        "User-Agent": "WanderlustApp/1.0 (contact: kanhabhardwajabhi@gmail.com)",
        "Accept-Language": "en",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} - ${text}`);
  }

  const data = await response.json();
    console.log(data);
  } catch (err) {
    console.log(err)
  }
  console.log("check1.3")
  if(data.length === 0) {
    req.flash("error", "Location not found!");
    return res.redirect("/listings/new");
  }
  console.log("check1");
  const coordinates = [data[0].lon, data[0].lat];
  const newListing = new Listing({
    ...req.body.listing,
    geometry: {
      type: "Point",
      coordinates
    },
    });
  let url = req.file.path;
  let filename = req.file.filename;
  newListing.owner = req.user._id;
  newListing.image = {url, filename};
  console.log("check2");
  await newListing.save();
  req.flash("success","New Listing Created!");
  console.log("check3");
  res.redirect("/listings");
  };

module.exports.renderEditForm = async (req,res)=>{
let {id} = req.params;
const listing = await Listing.findById(id); 
if(!listing){
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
}
let originalImageUrl = listing.image.url;
originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
res.render("listings/edit.ejs", {listing, originalImageUrl});  
};

module.exports.updateListing = async (req,res)=>{
  let {id} = req.params;
  let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
  if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success","Listing Updated!");
  res.redirect(`/listings/${id}`)
};

module.exports.destroyListing = async (req,res)=>{
  let {id} = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success","Listing Deleted!");
  res.redirect("/listings");

};








