import IClientDocument from "./models/clientDocument.interface";
import ITEmplateDocument from "./models/templateDocument.interface";

const objetToFormData = (obj: any) => {
    var form_data = new FormData();
    
    Object.entries(obj).forEach(([key, value]) => {
        form_data.append(key, value as string);
    });

    return form_data
}
const doesClientDocumentExist = (array: Array<IClientDocument>, clientDoc: IClientDocument): boolean => {
    return array.some((item: IClientDocument) => {
        return item.email == clientDoc.email
    });
}
const doesTemplateExist = (array: Array<ITEmplateDocument>, template: ITEmplateDocument): boolean => {
    return array.some((item: ITEmplateDocument) => {
        return item.name.toLowerCase() == template.name.toLowerCase()
    })
}

export default {
    objetToFormData,
    doesClientDocumentExist,
    doesTemplateExist
}