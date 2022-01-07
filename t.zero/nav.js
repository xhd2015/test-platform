// declare your routers here
import { JSONPretty, LogParser, RegexMatcher, StringConvert, GRPC, PodInfo, DataComposer } from "./view"


// collasp everything into as few places as possible, the best is 1 place.
const nav = [
    {
        path: '/json',
        text: 'JSON Tool',
        component: JSONPretty,
    },
    {
        path: '/grpc',
        text: 'GRPC',
        component: GRPC,
    },
    {
        path: '/pod/info',
        text: 'Pod Info',
        component: PodInfo,
    },
    // {
    //     path: '/data/compose',
    //     text: 'Data Compose',
    //     component: DataComposer,
    // },
    {
        path: '/data/compose',
        text: 'Data Compose',
        component: DataComposer,
    },
    {
        path: '/log/parser',
        text: 'Log Parser',
        component: LogParser,
    },
    {
        path: '/regex/matcher',
        text: 'Regex Matcher',
        component: RegexMatcher,
    },
    {
        path: '/string/conv',
        text: 'String Converter',
        component: StringConvert,
    },
]

export default nav