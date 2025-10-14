import express from "express";
import authenticate from "../../modules/config/authenticate";
import {
  createBookCategoryService,
  findBookCategoryByIdService,
  getAllBookCategoryService,
  getBookCategoryCountService,
  getBookCategoryTitleCountService,
  updateBookCategoryService,
} from "../../services/liberary/books/BookCategory.service";
import {
  createBookService,
  getAllBookService,
  getBookCountService,
  getBookTitleCountService,
  getSingleBookByIdService,
  updateBookService,
} from "../../services/liberary/books/Book.service";
import {
  createBookUserService,
  getBookUsersService,
} from "../../services/liberary/books/BookUsers.service";
import {
  createRoomSeatService,
  createRoomService,
  getAllDropdownRoomsService,
  getAllRoomSeatCountsService,
  getAllRoomService,
  getAllSeatsByRoomAndSectionService,
  getRoomAvailableSeatCountsService,
  getRoomCountService,
  getRoomTitleCountService,
  getSingleRoomByIdService,
  getUserReservationsService,
  reserveLiberarySeatService,
  updateRoomService,
} from "../../services/liberary/room/room.service";

const router = express();

// book
router.post("/book/create", authenticate, createBookService);
router.put("/book/:id", authenticate, updateBookService);
router.get("/book/single/:id", authenticate, getSingleBookByIdService);
router.post("/book", authenticate, getAllBookService);
router.post("/book/total/counts", authenticate, getBookCountService);
router.post("/book/total/title/counts", authenticate, getBookTitleCountService);

// category
router.get(
  "/book/category/single/:id",
  authenticate,
  findBookCategoryByIdService
);
router.post("/book/category/get", authenticate, getAllBookCategoryService);
router.post("/book/category/create", authenticate, createBookCategoryService);
router.put("/book/category/:id", authenticate, updateBookCategoryService);
router.post(
  "/book/category/total/counts",
  authenticate,
  getBookCategoryCountService
);
router.post(
  "/book/category/total/title/counts",
  authenticate,
  getBookCategoryTitleCountService
);

// Book User
router.post("/book/user/create", authenticate, createBookUserService);
router.post("/book/user/total/counts", authenticate, getBookUsersService);

// Liberary Room

router.post("/room/create", authenticate, createRoomService);
router.put("/room/:id", authenticate, updateRoomService);
router.get("/room/single/:id", authenticate, getSingleRoomByIdService);
router.post("/room", authenticate, getAllRoomService);
router.post("/room/dropdown", authenticate, getAllDropdownRoomsService);
router.post("/room/total/counts", authenticate, getRoomCountService);
router.post("/room/total/title/counts", authenticate, getRoomTitleCountService);

// Liberary Room Seat

router.post("/room/seat/create", authenticate, createRoomSeatService);
router.post(
  "/room/seat/total/counts",
  authenticate,getAllRoomSeatCountsService);
router.post("/room/seat", authenticate, getAllSeatsByRoomAndSectionService);
router.post(
  "/room/seat/available/total/counts",
  authenticate,
  getRoomAvailableSeatCountsService
);

// room reserve seat
router.post("/room/seat/reserve/create", authenticate, reserveLiberarySeatService);
router.post("/room/seat/reserve/details/user/:userId",authenticate,getUserReservationsService)
export default router;
