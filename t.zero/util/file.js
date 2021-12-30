export const CONTENT_EXCEL = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
export const CONTENT_JSON = "application/json"

/**
 *  if no file chosen, null is set to callback argument
 *  accept option example: .json, .xls, .xlsx
 * @param callback
 * @param option {binary=false,accept}
 *
 */
export function chooseFileToRead(callback, option) {
    let binary = option && option.binary

    let file = document.createElement('input')
    file.type = 'file'
    file.accept = option ? option.accept : null // 'image/png, image/jpeg'
    file.addEventListener('change', function (e) {
        if (file.files.length === 0) {
            callback(null, null)
            return
        }
        let reader = new FileReader()
        reader.onload = function (e) {
            callback(
                reader.result,
                file.files[0]
            )
        }
        if (binary) {
            reader.readAsBinaryString(file.files[0])
        } else {
            reader.readAsText(file.files[0])
        }
    })
    file.click()
}

/**
 *
 * @param callback
 * @param binary
 * @param includeFile  true-> return {file,result}, else return the result itself
 */
export function chooseFileArrayToRead(callback, { binary, includeFile }) {
    if (!callback) {
        throw "Requires callback([])"
    }
    let file = document.createElement('input')
    file.type = 'file'
    file.addEventListener('change', function (e) {
        if (file.files.length === 0) {
            callback([])
            return
        }
        let contentArray = []
        let i = 0
        let unfinished = file.files.length
        for (let file of file.files) {
            let reader = new FileReader()
            let j = i
            reader.onload = function (e) {
                if (includeFile) {
                    contentArray[j] = { result: reader.result, file: file }
                } else {
                    contentArray[j] = reader.result
                }
                unfinished--
                if (unfinished === 0) {
                    callback(contentArray)
                }
            }
            if (binary) {
                reader.readAsBinaryString(file.files[i])
            } else {
                reader.readAsText(file.files[i])
            }
            i++
        }
    })
    file.click()
}

export function chooseFileToSave(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {
        type: contentType
    });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

