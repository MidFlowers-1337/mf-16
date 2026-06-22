import { Truck, ArrowRight, ArrowLeft, ThermometerSun } from 'lucide-react';
import { useAppStore } from '../store';
import { cn, formatDate, transportMethodLabels } from '../lib/utils';

export default function Transport() {
  const { schedule } = useAppStore();

  const grouped: Record<string, typeof schedule> = {};
  for (const item of schedule) {
    if (!grouped[item.date]) grouped[item.date] = [];
    grouped[item.date].push(item);
  }

  const sortedDates = Object.keys(grouped).sort();

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const isTomorrow = (dateStr: string) => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return dateStr === t.toISOString().split('T')[0];
  };

  const getDateLabel = (dateStr: string) => {
    if (isToday(dateStr)) return '今天';
    if (isTomorrow(dateStr)) return '明天';
    return formatDate(dateStr);
  };

  const getWeekday = (dateStr: string) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const d = new Date(dateStr);
    return weekdays[d.getDay()];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-museum-900">运输安排</h1>
          <p className="text-museum-600 mt-1">未来 30 天内的展品发出与归还排期</p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-museum-600">展品发出</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-museum-600">展品归还</span>
          </div>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-xl border border-museum-100 shadow-sm p-16 text-center">
          <Truck className="w-16 h-16 text-museum-200 mx-auto mb-4" />
          <p className="text-lg font-serif text-museum-600">近期暂无运输安排</p>
          <p className="text-sm text-museum-400 mt-2">创建外借记录后会自动出现在这里</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => {
            const items = grouped[date];
            return (
              <div key={date}>
                <div className="flex items-center gap-4 mb-3">
                  <div className={cn(
                    'px-4 py-2 rounded-lg font-serif',
                    isToday(date)
                      ? 'bg-gold-500 text-museum-900 shadow-md'
                      : 'bg-museum-100 text-museum-700'
                  )}>
                    <span className="font-bold text-lg">{getDateLabel(date)}</span>
                    <span className="text-sm ml-2 opacity-75">· {getWeekday(date)} · {date.slice(5)}</span>
                  </div>
                  <div className="flex-1 h-px bg-museum-200" />
                  <span className="text-sm text-museum-400">{items.length} 项运输</span>
                </div>

                <div className="ml-6 border-l-2 border-museum-200 pl-6 space-y-3 relative">
                  {items.map((item, i) => (
                    <div key={i} className="relative">
                      <div className={cn(
                        'absolute -left-[34px] top-5 w-4 h-4 rounded-full border-4 bg-white z-10',
                        item.type === 'outbound' ? 'border-green-500' : 'border-blue-500'
                      )} />

                      <div className={cn(
                        'bg-white rounded-xl border shadow-sm p-5 transition-all hover:shadow-md',
                        item.type === 'outbound' ? 'border-green-100 hover:border-green-300' : 'border-blue-100 hover:border-blue-300'
                      )}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                              item.type === 'outbound' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                            )}>
                              {item.type === 'outbound'
                                ? <ArrowRight className="w-5 h-5" />
                                : <ArrowLeft className="w-5 h-5" />
                              }
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-serif font-semibold text-museum-900">
                                  {item.institutionName}
                                </h3>
                                <span className={cn(
                                  'text-xs px-2 py-0.5 rounded-full font-medium',
                                  item.type === 'outbound'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                                )}>
                                  {item.type === 'outbound' ? '展品发出' : '展品归还'}
                                </span>
                              </div>
                              <p className="text-sm text-museum-600">
                                <span className="font-medium">展品：</span>
                                {item.exhibits.map(e => (
                                  <span key={e.id} className="inline-flex items-center gap-1 mr-2">
                                    {e.name}
                                    {e.requiresTemperatureControl && (
                                      <ThermometerSun className="w-3 h-3 text-blue-600" />
                                    )}
                                  </span>
                                ))}
                              </p>
                              <p className="text-xs text-museum-400 mt-1">
                                运输方式：{transportMethodLabels[item.transportMethod]}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-museum-400">
                            外借记录 #{item.loanId}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
