import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  products: FavoriteType[] = [];
  cart: CartType | null = null;
  serverStaticPath: string = environment.serverStaticPath;

  productsWithQuantity: FavoriteType[] = [];

  constructor(private favoriteService: FavoriteService, private cartService: CartService) {
  }

  ngOnInit(): void {
    this.cartService.getCart()
      .subscribe((cartData: CartType | DefaultResponseType) => {
        if ((cartData as DefaultResponseType).error !== undefined) {
          throw new Error((cartData as DefaultResponseType).message);
        }

        this.cart = cartData as CartType;
        // ----------------------------------------------------------------
        this.favoriteService.getFavorites()
          .subscribe((favData: FavoriteType[] | DefaultResponseType) => {
            if ((favData as DefaultResponseType).error !== undefined) {
              const error = (favData as DefaultResponseType).message;
              throw new Error(error);
            }

            this.products = favData as FavoriteType[];
            this.productsWithQuantity = this.products.map((product) => {
              return {
                ...product,
                quantity: this.cart?.items.find(item => item.product.id === product.id)?.quantity ?? 1,
                productInCart: this.cart?.items.some(item => item.product.id === product.id)
              };
            })
          });
      });
  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          throw new Error(data.message);
        }
        this.products = this.products.filter(item => item.id !== id);
      })
  }

  updateCount(id: string, count: number) {
    if (this.cart) {
      this.cartService.updateCart(id, count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.cart = data as CartType;
        })
    }
  }

  addToCart(id: string, count: number) {
    this.cartService.updateCart(id, count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
      });

    this.productsWithQuantity = this.productsWithQuantity.map(product => {
      if (product.id === id) {
        product.productInCart = true;
      }
      return product;
    })
  }

}
