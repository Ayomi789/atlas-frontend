import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FileText, MessageSquare, Users, Layers } from 'lucide-react';
import { useStore } from '../lib/store';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const COLORS = ['#294637', '#4c7e38', '#277998', '#bd7119', '#7657c7', '#789483'];

export function Admin() {
  const { workspaceDocs, workspaceChats, workspaceMembers, teamActivity, state } =
    useStore();

  const totalChunks = workspaceDocs.reduce((s, d) => s + d.chunkCount, 0);
  const totalQuestions = workspaceChats.reduce(
    (s, c) => s + c.messages.filter((m) => m.role === 'user').length,
    0
  );

  const docsByType = useMemo(() => {
    const map: Record<string, number> = {};
    workspaceDocs.forEach((d) => {
      map[d.type] = (map[d.type] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  }, [workspaceDocs]);

const activityByDay = useMemo(() => {
    const days: Record<string, { date: string; uploads: number; chats: number }> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = {
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        uploads: 0,
        chats: 0,
      };
    }
    teamActivity.forEach((a) => {
      const key = a.createdAt.slice(0, 10);
      if (!days[key]) return;
      if (a.type === 'document_ready') days[key].uploads++;
      if (a.type === 'chat_question') days[key].chats++;
    });
    return Object.values(days);
  }, [teamActivity]);

  const questionsByUser = useMemo(() => {
    const map: Record<string, number> = {};
    workspaceChats.forEach((c) => {
      const user = state.users.find((u) => u.id === c.userId);
      const name = user?.name.split(' ')[0] || 'User';
      const qCount = c.messages.filter((m) => m.role === 'user').length;
      map[name] = (map[name] || 0) + qCount;
    });
    return Object.entries(map)
      .map(([name, questions]) => ({ name, questions }))
      .sort((a, b) => b.questions - a.questions);
  }, [workspaceChats, state.users]);

  const topDocs = useMemo(() => {
    const cites: Record<string, number> = {};
    workspaceChats.forEach((c) => {
      c.messages.forEach((m) => {
        m.citations?.forEach((cit) => {
          cites[cit.documentName] = (cites[cit.documentName] || 0) + 1;
        });
      });
    });
    return Object.entries(cites)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [workspaceChats]);

  const kpis = [
    { label: 'Documents', value: workspaceDocs.length, icon: FileText },
    { label: 'Questions asked', value: totalQuestions, icon: MessageSquare },
    { label: 'Active members', value: workspaceMembers.length, icon: Users },
    { label: 'Vector chunks', value: totalChunks, icon: Layers },
  ];

  const tooltipStyle = {
    background: '#fff',
    border: '1px solid #e7e7e2',
    borderRadius: 12,
    fontSize: 12,
    color: '#555851',
    boxShadow: '0 4px 12px rgba(22,30,24,.08)',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-.04em] text-[#22231f]">Analytics</h1>
        <p className="mt-1 text-sm text-[#74766f]">
          Workspace usage, RAG coverage, and engagement
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <k.icon className="h-5 w-5 text-[#385847]" />
              <Badge color="slate">live</Badge>
            </div>
            <div className="text-[25px] font-semibold tracking-[-.045em] text-[#22231f]">
              {k.value}
            </div>
            <div className="text-sm text-[#74766f]">{k.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-[#22231f]">Activity (14 days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityByDay}>
                <defs>
                  <linearGradient id="gChat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#294637" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#294637" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gUp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4c7e38" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#4c7e38" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecece8" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#96978f', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#96978f', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="chats"
                  stroke="#294637"
                  fill="url(#gChat)"
                  strokeWidth={2}
                  name="Chats"
                />
                <Area
                  type="monotone"
                  dataKey="uploads"
                  stroke="#4c7e38"
                  fill="url(#gUp)"
                  strokeWidth={2}
                  name="Uploads"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-[#22231f]">Documents by type</h2>
          <div className="h-64">
            {docsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={docsByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {docsByType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#96978f]">
                No data
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {docsByType.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#74766f]">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-[#22231f]">Questions by user</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={questionsByUser.length ? questionsByUser : [{ name: '—', questions: 0 }]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ecece8" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#96978f', fontSize: 11 }}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={70}
                  tick={{ fill: '#555851', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="questions" fill="#294637" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-[#22231f]">Most cited documents</h2>
          {topDocs.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#96978f]">
              Ask questions in AI Chat to generate citation stats
            </p>
          ) : (
            <div className="space-y-3">
              {topDocs.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#e7eee6] text-xs font-bold text-[#294637]">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-[#22231f]">{d.name}</div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#ecece8]">
                      <div
                        className="h-full rounded-full bg-[#294637]"
                        style={{
                          width: `${(d.count / (topDocs[0]?.count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-[#96978f]">{d.count} cites</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
