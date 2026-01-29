import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import LotoHeadTailTable from './LotoHeadTailTable';

interface LotteryResult {
    draw_date: string;
    special_prize: string;
    prize_1: string;
    prize_2: string[];
    prize_3: string[];
    prize_4: string[];
    prize_5: string[];
    prize_6: string[];
    prize_7: string[];
}

interface ResultTableProps {
    result: LotteryResult;
    showPrintButton?: boolean;
}

const padArray = (arr: string[] = [], length: number) => {
    const newArr = [...(arr || [])];
    while (newArr.length < length) {
        newArr.push('...');
    }
    return newArr;
};

export default function ResultTable({ result, showPrintButton = false }: ResultTableProps) {
    if (!result) return null;

    return (
        <div className="max-w-4xl mx-auto mb-8 font-sans">
            <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-300">
                {/* Header */}
                <div className="bg-lottery-red-700 text-white text-center py-4 border-b border-gray-300">
                    <h2 className="text-2xl font-bold uppercase tracking-wide">
                        Xổ Số Miền Bắc
                    </h2>
                    <p className="text-red-100 mt-1">
                        {format(parseISO(result.draw_date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                    </p>
                </div>

                {/* Main Result Table */}
                <table className="w-full text-center border-collapse">
                    <tbody>
                        {/* Special Prize */}
                        <tr className="bg-red-50/30">
                            <td className="w-24 md:w-32 py-2 md:py-4 font-bold text-gray-600 border border-gray-300 text-sm md:text-base">
                                Đặc biệt
                            </td>
                            <td className="py-2 md:py-4 border border-gray-300">
                                <span className="font-bold text-3xl md:text-5xl text-lottery-red-600 tracking-wider">
                                    {result.special_prize || '.....'}
                                </span>
                            </td>

                        </tr>

                        {/* Prize 1 */}
                        <tr>
                            <td className="py-2 md:py-3 font-bold text-gray-600 border border-gray-300 text-sm md:text-base">
                                Giải nhất
                            </td>
                            <td className="py-2 md:py-3 border border-gray-300">
                                <span className="font-bold text-xl md:text-2xl text-gray-800 tracking-wider">
                                    {result.prize_1 || '.....'}
                                </span>
                            </td>

                        </tr>

                        {/* Prize 2 */}
                        <tr className="bg-red-50/30">
                            <td className="py-2 md:py-3 font-bold text-gray-600 border border-gray-300 text-sm md:text-base">
                                Giải nhì
                            </td>
                            <td className="py-2 md:py-3 border border-gray-300">
                                <div className="flex flex-wrap justify-center gap-4 md:gap-16">
                                    {padArray(result.prize_2, 2).map((num, i) => (
                                        <span key={i} className="font-bold text-xl md:text-2xl text-gray-800 tracking-wide">
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            </td>

                        </tr>

                        {/* Prize 3 */}
                        <tr>
                            <td className="py-2 md:py-3 font-bold text-gray-600 border border-gray-300 text-sm md:text-base">
                                Giải ba
                            </td>
                            <td className="py-2 md:py-3 border border-gray-300">
                                <div className="grid grid-cols-3 gap-y-1 gap-x-2 md:gap-y-2 md:gap-x-12 max-w-2xl mx-auto items-center">
                                    {padArray(result.prize_3, 6).map((num, i) => (
                                        <span key={i} className="font-bold text-xl md:text-2xl text-gray-800 tracking-wide">
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            </td>

                        </tr>

                        {/* Prize 4 */}
                        <tr className="bg-red-50/30">
                            <td className="py-2 md:py-3 font-bold text-gray-600 border border-gray-300 text-sm md:text-base">
                                Giải tư
                            </td>
                            <td className="py-2 md:py-3 border border-gray-300">
                                <div className="flex flex-wrap justify-center gap-2 md:gap-12 px-2">
                                    {padArray(result.prize_4, 4).map((num, i) => (
                                        <span key={i} className="font-bold text-xl md:text-2xl text-gray-800 tracking-wide">
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            </td>

                        </tr>

                        {/* Prize 5 */}
                        <tr>
                            <td className="py-2 md:py-3 font-bold text-gray-600 border border-gray-300 text-sm md:text-base">
                                Giải năm
                            </td>
                            <td className="py-2 md:py-3 border border-gray-300">
                                <div className="grid grid-cols-3 gap-y-1 gap-x-4 md:gap-y-2 md:gap-x-16 max-w-lg mx-auto">
                                    {padArray(result.prize_5, 6).map((num, i) => (
                                        <span key={i} className="font-bold text-xl md:text-2xl text-gray-800 tracking-wide">
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            </td>

                        </tr>

                        {/* Prize 6 */}
                        <tr className="bg-red-50/30">
                            <td className="py-2 md:py-3 font-bold text-gray-600 border border-gray-300 text-sm md:text-base">
                                Giải sáu
                            </td>
                            <td className="py-2 md:py-3 border border-gray-300">
                                <div className="flex justify-center gap-8 md:gap-24">
                                    {padArray(result.prize_6, 3).map((num, i) => (
                                        <span key={i} className="font-bold text-xl md:text-2xl text-gray-800 tracking-wide">
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            </td>

                        </tr>

                        {/* Prize 7 */}
                        <tr>
                            <td className="py-2 md:py-3 font-bold text-gray-600 border border-gray-300 text-sm md:text-base">
                                Giải bảy
                            </td>
                            <td className="py-2 md:py-3 border border-gray-300">
                                <div className="flex justify-center gap-8 md:gap-24">
                                    {padArray(result.prize_7, 4).map((num, i) => (
                                        <span key={i} className="font-bold text-xl md:text-2xl text-lottery-red-600 tracking-wide">
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            </td>

                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Head/Tail Analysis */}
            <div className="mt-6">
                <LotoHeadTailTable result={result} />
            </div>
        </div>
    );
}
