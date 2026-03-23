 (function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      toggleBtn.innerHTML = sidebar.classList.contains('collapsed') ? '▶' : '◀';
    });

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let streak = JSON.parse(localStorage.getItem('streak')) || 0;
    let lastPresent = localStorage.getItem('lastPresent') || '';
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    
    function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }
    function saveNotes() { localStorage.setItem('notes', JSON.stringify(notes)); }
    function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, function(m){ if(m === '&') return '&amp;'; if(m === '<') return '&lt;'; if(m === '>') return '&gt;'; return m;}); }

    function renderTasks() {
      const list = document.getElementById('taskList');
      if(!list) return;
      let html = '';
      tasks.forEach((t,i) => {
        html += `<li class="task-item" style="display:flex; align-items:center; gap:10px; justify-content:space-between;">
          <span style="flex:1; ${t.completed ? 'text-decoration:line-through;color:gray;' : ''}">${escapeHtml(t.text)}</span>
          <div><button class="complete-task" data-index="${i}" style="background:#e2f0e2; border:none; border-radius:50%; width:38px; height:38px; cursor:pointer;">✔</button>
          <button class="delete-task" data-index="${i}" style="background:#ffe6ec; border:none; border-radius:50%; width:38px; height:38px; cursor:pointer;">✖</button></div>
        </li>`;
      });
      list.innerHTML = html;
    }
    function updateProgress() {
      const total = tasks.length;
      const done = tasks.filter(t => t.completed).length;
      const p = total === 0 ? 0 : Math.round((done/total)*100);
      document.getElementById('progressPercent').innerText = p+'%';
      document.getElementById('progressFill').style.width = p+'%';
      document.getElementById('completedCount').innerText = done;
      document.getElementById('totalCount').innerText = total;
    }
    function fullTaskRender() { renderTasks(); updateProgress(); saveTasks(); }
    
    document.getElementById('addTaskBtn')?.addEventListener('click', ()=>{
      const inp = document.getElementById('taskInput');
      if(!inp.value.trim()) return;
      tasks.push({text: inp.value.trim(), completed: false});
      inp.value = ''; fullTaskRender();
    });
    document.getElementById('taskList')?.addEventListener('click', (e)=>{
      const btn = e.target.closest('button');
      if(!btn) return;
      const idx = btn.getAttribute('data-index');
      if(idx === null) return;
      if(btn.classList.contains('complete-task')) { tasks[idx].completed = !tasks[idx].completed; fullTaskRender(); }
      else if(btn.classList.contains('delete-task')) { tasks.splice(idx,1); fullTaskRender(); }
    });
    document.getElementById('clearDone')?.addEventListener('click', ()=>{ tasks = tasks.filter(t => !t.completed); fullTaskRender(); });

    function updateStreakUI() { document.getElementById('streakDisplay').innerText = streak + (streak===1?' DAY':' DAYS'); }
    document.getElementById('presentBtn')?.addEventListener('click', ()=>{
      const today = new Date().toDateString();
      if(lastPresent === today) { alert('✅ ALREADY MARKED PRESENT TODAY!'); return; }
      const yesterday = new Date(Date.now()-86400000).toDateString();
      streak = (lastPresent === yesterday) ? streak+1 : 1;
      lastPresent = today;
      localStorage.setItem('streak', JSON.stringify(streak));
      localStorage.setItem('lastPresent', lastPresent);
      updateStreakUI();
    });
    document.getElementById('deleteStreakBtn')?.addEventListener('click', ()=>{
      if(confirm('⚠️ RESET STREAK TO ZERO?')) { streak = 0; lastPresent = ''; localStorage.setItem('streak', JSON.stringify(streak)); localStorage.setItem('lastPresent', lastPresent); updateStreakUI(); }
    });

    function renderNotes() {
      let html = '';
      notes.forEach((n,i) => { html += `<div style="background:white; border-radius:40px; padding:12px 20px; margin:8px 0; display:flex; justify-content:space-between; align-items:center;"><span>📌 ${escapeHtml(n)}</span><button class="delNote" data-idx="${i}" style="background:#ffe2ec; border:none; border-radius:50%; width:32px; height:32px; cursor:pointer;">🗑️</button></div>`; });
      document.getElementById('notesList').innerHTML = html;
      document.querySelectorAll('.delNote').forEach(b => b.addEventListener('click', function(){ const idx = this.getAttribute('data-idx'); if(idx !== null){ notes.splice(idx,1); saveNotes(); renderNotes(); } }));
    }
    document.getElementById('saveNoteBtn')?.addEventListener('click', ()=>{ const txt = document.getElementById('noteInput').value.trim(); if(txt){ notes.push(txt); saveNotes(); document.getElementById('noteInput').value = ''; renderNotes(); } });

    const quotes = ['"KEEP GOING — YOU GOT THIS"','"SMALL STEPS EVERY DAY"','"DISCIPLINE BEATS MOTIVATION"','"FOCUS ON THE PROCESS"','"PROGRESS OVER PERFECTION"','"STAY CONSISTENT, STAY STRONG"','"YOU ARE CAPABLE OF AMAZING THINGS"'];
    document.getElementById('newQuote')?.addEventListener('click', ()=>{ document.getElementById('quoteBox').innerText = quotes[Math.floor(Math.random()*quotes.length)]; });

    document.getElementById('fbSend')?.addEventListener('click', ()=>{
      const name = document.getElementById('fbName').value.trim();
      const email = document.getElementById('fbEmail').value.trim();
      const msg = document.getElementById('fbMsg').value.trim();
      if(!msg) { alert('PLEASE WRITE YOUR FEEDBACK 💬'); return; }
      let response = '🙏 THANK YOU';
      if(name) response += `, ${name}`;
      response += '! YOUR FEEDBACK HELPS US GROW.';
      document.getElementById('fbThanks').innerText = response;
      document.getElementById('fbName').value = '';
      document.getElementById('fbEmail').value = '';
      document.getElementById('fbMsg').value = '';
      setTimeout(()=>{ document.getElementById('fbThanks').innerText = ''; }, 3000);
    });

    const subjectContainer = document.getElementById('subjectContainer');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const generateBtn = document.getElementById('generateTimetableBtn');
    const planSlots = document.getElementById('planSlots');
    
    let isAM = true;
    const amBtn = document.getElementById('ampmAM');
    const pmBtn = document.getElementById('ampmPM');
    amBtn.addEventListener('click', () => { isAM = true; amBtn.classList.add('active'); pmBtn.classList.remove('active'); });
    pmBtn.addEventListener('click', () => { isAM = false; amBtn.classList.remove('active'); pmBtn.classList.add('active'); });

    function createSubjectRow(value = '') {
      const row = document.createElement('div');
      row.className = 'subject-row';
      row.innerHTML = `<input type="text" placeholder="SUBJECT NAME" value="${escapeHtml(value)}"><button class="remove-btn">✖</button>`;
      row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
      return row;
    }
    function initSubjects() {
      subjectContainer.innerHTML = '';
      ['MATHEMATICS', 'PHYSICS', 'LITERATURE'].forEach(s => subjectContainer.appendChild(createSubjectRow(s)));
    }
    initSubjects();
    addSubjectBtn.addEventListener('click', () => subjectContainer.appendChild(createSubjectRow('')));

    function formatTimeFromMinutes(minsSinceMidnight) {
      let totalMin = minsSinceMidnight;
      let hrs24 = Math.floor(totalMin / 60) % 24;
      let mins = totalMin % 60;
      let period = hrs24 >= 12 ? 'PM' : 'AM';
      let hrs12 = hrs24 % 12;
      if(hrs12 === 0) hrs12 = 12;
      return `${hrs12}:${mins.toString().padStart(2,'0')} ${period}`;
    }

    generateBtn.addEventListener('click', () => {
      const rows = document.querySelectorAll('#subjectContainer .subject-row input');
      const subjects = [];
      rows.forEach(inp => { if(inp.value.trim()) subjects.push(inp.value.trim()); });
      if(subjects.length === 0) { alert('ADD AT LEAST ONE SUBJECT'); return; }
      
      let startHourInput = parseInt(document.getElementById('startHour').value, 10);
      if(isNaN(startHourInput) || startHourInput < 1 || startHourInput > 12) startHourInput = 9;
      let hour24 = isAM ? (startHourInput % 12) : ((startHourInput % 12) + 12);
      if(isAM && startHourInput === 12) hour24 = 0;
      if(!isAM && startHourInput === 12) hour24 = 12;
      
      let studyHoursVal = parseInt(document.getElementById('studyHours').value, 10) || 0;
      let studyMinsVal = parseInt(document.getElementById('studyMinutes').value, 10) || 0;
      let totalStudyMinutes = (studyHoursVal * 60) + studyMinsVal;
      if(totalStudyMinutes <= 0) { alert('ENTER VALID STUDY DURATION'); return; }
      
      let breakMins = parseInt(document.getElementById('breakMinutes').value, 10);
      if(isNaN(breakMins) || breakMins < 1) breakMins = 5;
      let numberOfBreaks = subjects.length - 1;
      let totalBreakTime = numberOfBreaks * breakMins;
      
      if(totalBreakTime >= totalStudyMinutes) {
        alert(`⚠️ BREAKS (${totalBreakTime}min) exceed study time. Reduce break duration or increase study time.`);
        return;
      }
      
      const totalStudyForSubjects = totalStudyMinutes - totalBreakTime;
      let perSubjectBase = Math.floor(totalStudyForSubjects / subjects.length);
      let remainder = totalStudyForSubjects % subjects.length;
      let currentMinutes = (hour24 * 60);
      let html = '';
      
      for(let i=0; i<subjects.length; i++) {
        let extra = i < remainder ? 1 : 0;
        let duration = perSubjectBase + extra;
        let startTime = formatTimeFromMinutes(currentMinutes);
        let endTime = formatTimeFromMinutes(currentMinutes + duration);
        html += `<div class="slot">
          <span class="time-badge">${startTime} – ${endTime}</span>
          <span class="subject-badge">📖 ${escapeHtml(subjects[i])}</span>
        </div>`;
        currentMinutes += duration;
        if(i < subjects.length-1) {
          let breakStart = formatTimeFromMinutes(currentMinutes);
          let breakEnd = formatTimeFromMinutes(currentMinutes + breakMins);
          html += `<div class="slot">
            <span class="time-badge">${breakStart} – ${breakEnd}</span>
            <span class="break-badge">☕ BREAK ${breakMins} MIN</span>
          </div>`;
          currentMinutes += breakMins;
        }
      }
      planSlots.innerHTML = html;
    });

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        navItems.forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        const target = this.getAttribute('data-target');
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      });
    });
    
    fullTaskRender(); updateStreakUI(); renderNotes();
    document.getElementById('quoteBox').innerText = '"JUST START"';
  })();