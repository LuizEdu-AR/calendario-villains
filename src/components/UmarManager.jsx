import { useEffect, useMemo, useState } from 'react';
import { createRecord, removeRecord, subscribeCollection, updateRecord } from '../services/calendarService';
import { ConfirmDialog, Toast } from './Feedback';
import SelectPicker from './SelectPicker';
import { TimePicker } from './DateTimePickers';

const DAYS = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const EMPTY = { name:'', memberId:'', course:'', day:'0', time:'19:00' };
const sortMembers = (a,b) => Number(a.day)-Number(b.day) || a.time.localeCompare(b.time) || a.name.localeCompare(b.name,'pt-BR');

export default function UmarManager({ mode }) {
  const [members,setMembers] = useState([]);
  const [weeks,setWeeks] = useState([]);
  const [attendance,setAttendance] = useState([]);
  const [loaded,setLoaded] = useState({ members:false, weeks:false, attendance:false });
  const [form,setForm] = useState(null);
  const [editing,setEditing] = useState(null);
  const [choice,setChoice] = useState(null);
  const [reason,setReason] = useState('');
  const [deleting,setDeleting] = useState(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');
  const [search,setSearch] = useState('');
  const [filterDay,setFilterDay] = useState('all');
  useEffect(() => {
    const subs = ['umarMembers','umarWeeks','umarAttendance'].map((name,i) => subscribeCollection(name, rows => {
      const setter = [setMembers,setWeeks,setAttendance][i];
      setter(rows);
      setLoaded(old => ({...old,[['members','weeks','attendance'][i]]:true}));
    }, () => setError('Não foi possível carregar os dados da UMAR. Verifique as permissões do Firestore.')));
    return () => subs.forEach(unsub => unsub());
  },[]);
  const ordered = useMemo(() => [...members].sort(sortMembers),[members]);
  const shown = useMemo(() => ordered.filter(m => `${m.name} ${m.memberId} ${m.course}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')) && (filterDay==='all' || String(m.day)===filterDay)),[ordered,search,filterDay]);
  const orderedWeeks = useMemo(() => [...weeks].sort((a,b) => a.number-b.number),[weeks]);
  const entryFor = (memberId,weekId) => attendance.find(a => a.memberRef===memberId && a.weekRef===weekId);
  async function run(fn,message) {
    setBusy(true);setError('');
    try { await fn();setSuccess(message);return true; }
    catch(e) {console.error(e);setError('Não foi possível salvar. Verifique os dados e suas permissões.');return false;}
    finally {setBusy(false);}
  }
  async function saveMember(e) {
    e.preventDefault();
    const data = {...form,name:form.name.trim(),memberId:form.memberId.trim(),course:form.course.trim()};
    if (!data.name || !data.memberId || !data.course || !data.time) return setError('Preencha todos os campos.');
    if (members.some(m => m.memberId===data.memberId && m.id!==editing?.id)) return setError('Já existe um membro cadastrado com esse ID.');
    const ok = await run(() => editing ? updateRecord('umarMembers',editing.id,data) : createRecord('umarMembers',data),'Membro salvo com sucesso.');
    if(ok){setForm(null);setEditing(null);}
  }
  async function addWeek() {
    const number = orderedWeeks.reduce((max,w)=>Math.max(max,Number(w.number)||0),0)+1;
    await run(()=>createRecord('umarWeeks',{number,createdAt:new Date().toISOString()}),`Semana ${number} adicionada.`);
  }
  async function saveAttendance(status) {
    if(!choice) return;
    const old = entryFor(choice.member.id,choice.week.id);
    const data = {memberRef:choice.member.id,weekRef:choice.week.id,status,justification:status==='absent'?reason.trim():'',updatedAt:new Date().toISOString()};
    const ok=await run(()=>old?updateRecord('umarAttendance',old.id,data):createRecord('umarAttendance',data),'Frequência registrada.');
    if(ok){setChoice(null);setReason('');}
  }
  async function deleteMember() {
    const target=deleting;
    if(!target) return;
    const ok=await run(async()=>{
      await Promise.all(attendance.filter(a=>a.memberRef===target.id).map(a=>removeRecord('umarAttendance',a.id)));
      await removeRecord('umarMembers',target.id);
    },'Membro removido.');
    if(ok)setDeleting(null);
  }
  const ready=Object.values(loaded).every(Boolean);
  return <div className="umar-module">
    <Toast message={error} tone="error" onClose={()=>setError('')}/><Toast message={success} onClose={()=>setSuccess('')}/>
    {!ready ? <div className="calendar-loading"><span className="villains-spinner"/>Carregando dados...</div> : mode==='members' ? <>
      <div className="umar-toolbar"><input className="search-input" placeholder="Pesquisar nome, ID ou curso..." value={search} onChange={e=>setSearch(e.target.value)}/><button className="button primary" onClick={()=>{setEditing(null);setForm({...EMPTY});}}>+ Novo membro</button></div>
      <div className="umar-member-list">{shown.map(m=><article className="umar-member" key={m.id}><div><strong>{m.name}</strong><small>ID {m.memberId} · {m.course}</small><small>{DAYS[Number(m.day)]} · {m.time}</small></div><div className="item-actions"><button onClick={()=>{setEditing(m);setForm({name:m.name,memberId:m.memberId,course:m.course,day:String(m.day),time:m.time});}}>Editar</button><button className="danger-text" onClick={()=>setDeleting(m)}>Excluir</button></div></article>)}{!shown.length&&<p className="empty-state">Nenhum membro encontrado.</p>}</div>
    </> : <>
      <div className="umar-toolbar"><p className="section-description">Registre a presença dos alunos em cada semana.</p><button className="button primary" disabled={busy} onClick={addWeek}>+ Adicionar semana</button></div>
      <div className="umar-filters"><input className="search-input" placeholder="Pesquisar membro..." value={search} onChange={e=>setSearch(e.target.value)}/><SelectPicker value={filterDay} onChange={setFilterDay} options={[{value:'all',label:'Todos os dias'},...DAYS.map((day,i)=>({value:String(i),label:day}))]}/></div>
      <div className="umar-table-scroll"><table className="umar-table"><thead><tr><th>Membro</th>{orderedWeeks.map(w=><th key={w.id}>Semana {w.number}</th>)}</tr></thead><tbody>{shown.map(m=><tr key={m.id}><td><strong>{m.name}</strong><small>{DAYS[Number(m.day)]} · {m.time}</small></td>{orderedWeeks.map(w=>{const a=entryFor(m.id,w.id);return <td key={w.id}><button className={`umar-attendance ${a?.status||'pending'}`} aria-label={`Registrar frequência de ${m.name} na semana ${w.number}`} title={a?.justification||'Registrar frequência'} onClick={()=>{setChoice({member:m,week:w,stage:'select'});setReason(a?.justification||'');}}>{a?.status==='present'?'✓':a?.status==='absent'?'×':'−'}</button></td>;})}</tr>)}</tbody></table>{!shown.length&&<p className="empty-state">Nenhum membro encontrado.</p>}</div>
      <div className="umar-legend"><span>✓ Presente</span><span>× Ausente</span><span>− Não registrado</span></div>
    </>}
    {form&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setForm(null);}}><div className="editor-modal umar-dialog" role="dialog" aria-modal="true" aria-label="Cadastro de membro"><div className="editor-heading"><h2>{editing?'Editar membro':'Novo membro'}</h2><button className="close-button" onClick={()=>setForm(null)} aria-label="Fechar">×</button></div><form className="umar-form" onSubmit={saveMember}><label>Nome<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><div className="umar-form-row"><label>ID<input required value={form.memberId} onChange={e=>setForm({...form,memberId:e.target.value})}/></label><label>Curso<input required value={form.course} onChange={e=>setForm({...form,course:e.target.value})}/></label></div><label>Dia da semana<SelectPicker value={form.day} onChange={day=>setForm({...form,day})} options={DAYS.map((day,i)=>({value:String(i),label:day}))}/></label><label>Horário de início<TimePicker value={form.time} onChange={time=>setForm({...form,time})}/></label><div className="umar-dialog-actions"><button type="button" className="button subtle" onClick={()=>setForm(null)}>Cancelar</button><button className="button primary" disabled={busy}>Salvar membro</button></div></form></div></div>}
    {choice&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setChoice(null);}}><div className="editor-modal umar-dialog umar-choice" role="dialog" aria-modal="true" aria-label="Registrar frequência"><div className="editor-heading"><h2>{choice.stage==='select'?'Registrar frequência':'Registrar ausência'}</h2><button className="close-button" onClick={()=>setChoice(null)} aria-label="Fechar">×</button></div><p className="umar-choice-caption">{choice.member.name} · Semana {choice.week.number}</p>{choice.stage==='select'?<div className="umar-status-options"><button disabled={busy} className="umar-status-present" onClick={()=>saveAttendance('present')}>✓ Presente</button><button className="umar-status-absent" onClick={()=>setChoice({...choice,stage:'absence'})}>× Ausente</button></div>:<><label className="umar-justification">Justificativa (opcional)<textarea rows={4} placeholder="Informe a justificativa, se houver..." value={reason} onChange={e=>setReason(e.target.value)}/></label><div className="umar-dialog-actions"><button className="button subtle" onClick={()=>setChoice({...choice,stage:'select'})}>Voltar</button><button className="button primary" disabled={busy} onClick={()=>saveAttendance('absent')}>Salvar ausência</button></div></>}</div></div>}
    {deleting&&<ConfirmDialog title="Excluir membro" description={`Excluir “${deleting.name}” e seus registros de frequência? Esta ação não poderá ser desfeita.`} danger confirmLabel="Excluir" busy={busy} onCancel={()=>setDeleting(null)} onConfirm={deleteMember}/>}
  </div>;
}
