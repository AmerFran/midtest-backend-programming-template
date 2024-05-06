const tokoService = require('./market-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { Toko } = require('../../../models');

//pagination
async function getUsers(req, res, next) {
  try {
    const pageNumber = parseInt(req.query.page_number, 10) || 1;
    const pageSize = parseInt(req.query.page_size, 10) || 10;
    const search = req.query.search || '';

    // Validate and sanitize Toko input
    const pageNumberValid = pageNumber > 0;
    const pageSizeValid = pageSize > 0;

    if (!(pageNumberValid && pageSizeValid)) {
      return res.status(400).send({ error: 'Invalid query parameters' });
    }

    const skip = (pageNumber - 1) * pageSize;
    // Membuat parameter dan fungsi sorting
    const sort = req.query.sort && req.query.sort.split(':');
    const sortField = sort && sort[0];
    const sortType = sort && sort[1];

    let sortOpsi = {}; // baris ini menginialisasi objek kosong yg menyimpan kriteria untuk operasi search
    if (sortField && sortType) {
      sortOpsi[sortField] = sortType === 'asc' ? 1 : -1;
    } else {
      // sorting default jika tidak di tuliskan di crud
      sortOpsi = { name: 1 };
    }

    // Membuat fungsi search
    let searchC = {};
    if (search) {
      searchC = {
        $or: [
          { name: { $regex: search, $options: 'i' } }, // search dari nama
          { email: { $regex: search, $options: 'i' } }, // search dari email
        ],
      };
    }

    const count = await Toko.countDocuments(searchC);
    const users = await Toko.find(searchC)
      .sort(sortOpsi)
      .skip(skip)
      .limit(pageSize);

    // menghitung pagination dan menambahkan fitur sesuai pdf
    const total_pages = Math.ceil(count / pageSize);
    const has_previous_page = pageNumber > 1;
    const has_next_page = pageNumber < total_pages;

    const hasil = {
      page_number: pageNumber,
      page_size: pageSize,
      count: count,
      total_pages: total_pages,
      has_previous_page: has_previous_page,
      has_next_page: has_next_page,
      data: users,
    };

    res.send(hasil);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
}

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */

/**
 * Handle get Toko detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const Toko = await tokoService.getUser(request.params.id);

    if (!Toko) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown Toko');
    }

    return response.status(200).json(Toko);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create Toko request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await tokoService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await tokoService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create Toko'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update Toko request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await tokoService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await tokoService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update account'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete Toko request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await tokoService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete Toko'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change Toko password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await tokoService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await tokoService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
