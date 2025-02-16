// noinspection ES6MissingAwait

import Resource from '../models/Resource.js';
import ResourcePrice from '../models/ResourcePrice.js';
import axios from "axios";

export async function get(request, response) {
  const {
    shouldDisplayOldPrices,
  } = request.query;

  // const formattedSearch = new RegExp(
  //     (decodeURIComponent(search)
  //             .replace(/,*$/, '')
  //             .replaceAll(', ', ',')
  //             .replaceAll(',', '|')
  //             .toLowerCase()
  //             .trimStart()
  //     ),
  //     'i');
  const query = Resource.find().sort({
    timesRequiredInRecipes: "desc",
  });

  if (shouldDisplayOldPrices === 'true') {
    query.find({
      priceUpdatedAt: {
            $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        }
    })
  }

  const resources = await query.exec();



  response.json(resources);
}

export async function fill(request, response) {
  const {data: resources} = await axios.get('https://fr.dofus.dofapi.fr/resources').then(response => response);
  await Promise.all(resources.map(async (resource) => {
    const {name, level, type, imgUrl, description} = resource;
    await Resource.create({
      name,
      level,
      type,
      imgUrl,
      description
    })
  }))
  response.json({
    message: "Challah comme on dit.",
  })
}

export async function update(request, response) {
  const {_id} = request.params;
  const {currentPrice, soldByTen, soldByHundred, isWantedForTen, isWantedForHundred, name} = request.fields;

  const resource = await Resource.findById(_id);
  resource.currentPrice = currentPrice;
  resource.soldByTen = soldByTen;
  resource.soldByHundred = soldByHundred;
  resource.isWantedForTen = isWantedForTen;
  resource.isWantedForHundred = isWantedForHundred;
  if (name) {
    resource.name = name;
  }

  await resource.save();

  response.json({
    updatedResource: resource,
  })
}

export async function getPricesHistory(request, response) {
  const name = new RegExp(decodeURIComponent(request.params.name).toLowerCase(), 'i');
  const resource = await Resource.findOne({name})

  if (resource) {
    response.json({
      prices: await ResourcePrice.find({resourceId: resource._id})
    })
  }
}
