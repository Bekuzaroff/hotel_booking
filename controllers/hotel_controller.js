const Hotel = require('./../models/hotel');

exports.get_all_hotels = async (req, res) => {
    try{
        let query = Hotel.find();

        //SORTING
        let sort_type = req.query.sort;
        
        if(sort_type){
            query = query.sort(sort_type);
        }else{
            query = query.sort("rating");
        }

        //PAGINATION
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;

        query = query.skip(limit * (page - 1)).limit(limit);
        

        const hotels = await query;
        res.status(200).json({
            status: 'success',
            data:{
                hotels
            }
        });
        
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
}

exports.get_five_rated_hotels = async (req, res, next) => {
    const hotels = await Hotel.aggregate([
        {
            $match: {
                rating: 5.0
            },
        },
    {
        $sort: {name: 1},

    },

    ]);

    res.status(200).json({
        status: 'success',
        count: hotels.length,
        data: {
            hotels
        }
    })
}
exports.search_hotel_by_name = async (req, res) => {
    try{
        let q = req.query.name;
        
        let found_hotels = await Hotel.find();

        found_hotels = found_hotels.filter((obj) => obj.name.toLocaleLowerCase().includes(q.toLocaleLowerCase()));

        res.status(200).json({
            status: 'success',
            data: {
                found_hotels
            }
        })
        }catch(err){
            res.status(404).json({
                status: 'fail',
                message: err.message
            });
        }
}

exports.add_hotel_to_db = async (req, res) => {
    try{
        await Hotel.create(req.body);
        
        res.status(201).json({
            status: 'success',
            message: 'hotel added successfully'
        });
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
}

exports.update_hotels_field = async (req, res) => {
    try{
        let new_hotel = await Hotel.findByIdAndUpdate(req.query.id, req.body);

        res.status(200).json({
            status: "success",
            data: {
                new_hotel
            }
        })
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
}

exports.delete_hotels_field = async (req, res) => {
    try{
        let new_hotel = await Hotel.findByIdAndDelete(req.query.id, req.body);

        res.status(200).json({
            status: "success",
            data: {
                new_hotel
            }
        })
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
}
exports.get_hotel_by_id = async(req, res) => {
    try{
        let hotel = await Hotel.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                hotel
            }
        })
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
}



