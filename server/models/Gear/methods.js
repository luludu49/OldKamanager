import GearPrice from "../GearPrice.js";
import Resource from "../Resource.js";

const methods = {

  /**
   * Set the last price updated date to today
   * @return {Promise<void>}
   * @memberOf Gear#
   */
  async updateLastPriceDate() {
    this.lastPriceUpdatedAt = Date.now();
    await this.save();
  },

  async updatePricesHistory() {
    return GearPrice.create({
      GearId: this._id,
      price: this.currentPrice,
      craftingPrice: this.craftingPrice,
      recordDate: Date.now(),
    })
  },

  /**
   * Merge recipe and initial resources fields
   * @returns {Promise<void>}
   */
  formattedRecipe: async function() {
    const resources = await Resource.find({
        name: {
            $in: this.recipe.map(({name}) => name)
        }
    })

    return resources.map(resource => {
      return {
        ...resource._doc,
        quantity: this.recipe.find(({name}) => name === resource.name).quantity
      }
    })
  },

  /**
   * Update the gear info based on the new recipe price
   * Crafting price, ratio, history, and last changed values
   * @return {Promise<void>}
   */
  async onRecipePriceChange() {
    this.craftingPrice = await this.calculateCraftingPrice();
    this.ratio = this.currentPrice / (this.craftingPrice || 1);
    this.save();
  },

  setCraftingPrice: async function (price) {
    this.craftingPrice = price;
    await this.save();
  },

  calculateCraftingPrice: async function () {
    const recipe = await this.formattedRecipe();
    const totalCraftingPrice = recipe.reduce((accumulator, resource) => {
      return accumulator + resource?.currentPrice * resource.quantity || 0
    }, 0);
    if (totalCraftingPrice === 0) {
      console.log("A problem occurred while calculating the crafting price of " + this.name + " : " + recipe);
    }
    return totalCraftingPrice;
  },
  updateRatio: async function () {
    this.ratio = this.currentPrice / this.craftingPrice;
    this.save();
  }
}

export default methods;