import React, {useEffect, useState} from "react"
import ShoppingDisplay from "./ShoppingDisplay"
import {useQuery} from "react-query";
import {getFromServer} from "../../../services/server";
import {ShoppingQuery} from "./types";

export default function Shopping() {
  const {data} = useQuery<ShoppingQuery>('shopping', fetchShopping);
  /**
   * Hidden items are items that are hidden and can't be shown again
   */
  const [hiddenItems, setHiddenItems] = useState<string[]>([]);
  /**
   * Soft hidden items are items that are hidden but can be shown again
   */
  const [softHiddenItems, setSoftHiddenItems] = useState<string[]>([]);
  const [lastHiddenItem, setLastHiddenItem] = useState<string | null>(null);
  const [savedAmount, setSavedAmount] = useState<number>(0);
  const items = getItemsWithoutHiddenItems(data);
  items.sort((a, b) => b.currentPrice * b.quantity - a.currentPrice * a.quantity);
  const total = items.reduce((accumulator, {currentPrice, quantity, name}) => !hiddenItems.includes(name) ? accumulator + currentPrice * quantity : accumulator, 0);
  const income = data?.estimatedIncome || 0;
  const slots = data?.slots || 0;
  const benefit = income - total;
  const ingredientsCount = items.length;

  const ratio = Math.round(income / total * 100)

  useEffect(() => {
    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'Dead') {
        softHideFirstItem();
      }
    }
    // Add event listener to ^ key to trigger softHide
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    }
  }, [items]);

  return (
    <ShoppingDisplay
      savedAmount={savedAmount.toString()}
      items={items}
      total={total.toLocaleString('FR-fr')}
      onHide={hideFromList}
      estimatedIncome={income.toLocaleString('FR-fr')}
      benefit={benefit.toLocaleString('FR-fr')}
      slots={slots}
      ratio={`${ratio > 0 ? '+' : '-'}${ratio}`}
      onCancelActionClick={cancelLastAction}
      softHide={softHideFirstItem}
      showSoftHiddenItems={showSoftHiddenItems}
      ingredientsCount={ingredientsCount.toString()}
    />
  )

  function showSoftHiddenItems() {
    setSoftHiddenItems([]);
  }

  /**
   * Get the items without the hidden items and the soft hidden items
   * @param data List of Items
   */
  function getItemsWithoutHiddenItems(data: ShoppingQuery | undefined) {
    const dataWithoutHiddenItems = data?.list?.filter(({name}) => !hiddenItems.includes(name) ) || [];
    return dataWithoutHiddenItems.filter(({name}) => !softHiddenItems.includes(name));
  }

  /**
   * Add the firstItem to the soft HiddenItems list (we can get them back)
  */
  function softHideFirstItem() {
    const firstItem = items[0];
    if (firstItem) {
      setSoftHiddenItems([...softHiddenItems, firstItem.name]);
    }
  }

  /**
   * Restore the lastHiddenItem in the hiddenItems list
   * Empty the lastHiddenItem
   */
  function cancelLastAction() {
    if (lastHiddenItem) {
      setHiddenItems(hiddenItems.filter(item => item !== lastHiddenItem));
      setLastHiddenItem(null);
    }
  }

  async function fetchShopping() {
    return getFromServer('/shopping').then(response => response.data);
  }

  /**
   * Hide an item from the list
   * Add the item price to the savedAmount
   * @param name
   */
  function hideFromList(name: string) {
    setLastHiddenItem(name);
    const item = items.find(item => item.name === name);
    if (item) {
      setSavedAmount(savedAmount + item.currentPrice * item.quantity);
    }
    setHiddenItems([...hiddenItems, name]);
  }
}
