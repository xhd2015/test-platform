console.log("loading ThriftWrapper")


_reqWrapper = function (creator, name, obj) {
    this._creator = creator
    this._name = name
    this._obj = null
    // if args is not present,it is used to read
    if (obj) {
        this._obj = obj
    }
}

_reqWrapper.prototype = {};
_reqWrapper.prototype.read = function (input) {
    input.readStructBegin();
    while (true) {
        var ret = input.readFieldBegin();
        var fname = ret.fname;
        var ftype = ret.ftype;
        var fid = ret.fid;
        if (ftype == Thrift.Type.STOP) {
            break;
        }
        switch (fid) {
            case 1:
                // req must be struct
                if (ftype == Thrift.Type.STRUCT) {
                    this._obj = this._creator()
                    this._obj.read(input)
                } else {
                    console.log("req not struct at field 1,ignores")
                    input.skip(ftype)
                }
                break;
            default:
                input.skip(ftype);
        }
        input.readFieldEnd();
    }
    input.readStructEnd();
};

_reqWrapper.prototype.write = function (output) {
    output.writeStructBegin(this._name)
    if (this._obj != null && this._obj != undefined) {
        output.writeFieldBegin('Req', Thrift.Type.STRUCT, 1);
        this._obj.write(output);
        output.writeFieldEnd();
    }
    output.writeFieldStop();
    output.writeStructEnd();
};


// resp
_respWrapper = function (creator, name, obj) {
    this._creator = creator
    this._name = name
    this._obj = null
    // if args is not present,it is used to read
    if (obj) {
        this._obj = obj
    }
}

_respWrapper.prototype = {};
_respWrapper.prototype.read = function (input) {
    input.readStructBegin();
    while (true) {
        var ret = input.readFieldBegin();
        var fname = ret.fname;
        var ftype = ret.ftype;
        var fid = ret.fid;
        if (ftype == Thrift.Type.STOP) {
            break;
        }
        switch (fid) {
            case 0:
                if (ftype == Thrift.Type.STRUCT) {
                    this._obj = this._creator()
                    this._obj.read(input)
                } else {
                    console.log("resp not struct at field 1,ignores")
                    input.skip(ftype)
                }
                break;
            default:
                input.skip(ftype);
        }
        input.readFieldEnd();
    }
    input.readStructEnd();
};

_respWrapper.prototype.write = function (output) {
    output.writeStructBegin(this._name)
    if (this._obj != null && this._obj != undefined) {
        output.writeFieldBegin('Success', Thrift.Type.STRUCT, 1);
        this._obj.write(output);
        output.writeFieldEnd();
    }
    output.writeFieldStop();
    output.writeStructEnd();
};


class ThriftWrapper {
    static wrapReq(name, obj) {
        return new _reqWrapper(null, name, obj)
    }

    static wrapResp(creator) {
        return new _respWrapper(creator, null, null)
    }
}
