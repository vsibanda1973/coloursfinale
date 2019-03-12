import { Injectable, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "angularfire2/firestore";
import { auth } from 'firebase';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, Observer } from 'rxjs';
import { map, timestamp } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import * as moment from 'moment';
import { Enterprise, ParticipantData, companyChampion, Department, asset, assetInProject } from "../models/enterprise-model";
import { Project, abridgedBill, workItem, Section } from "../models/project-model";
import { Task } from "../models/task-model";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  
  user: firebase.User;
  userId: any;
  projects: Observable<Project[]>;
  myProjectTasks: Observable<Task[]>;
  tasksImChampion: Observable<Task[]>;
  currentProject: Project;
  project: Project;
  currentProjectId: any;
  companies: Observable<Enterprise[]>;
  participants: Observable<any[]>;
  companyTasks: Observable<Task[]>;
  showStaffTasks: Observable<Task[]>;
  labour: Observable<ParticipantData[]>;
  staffTaskActions: Observable<workItem[]>;
  Bill: Observable<abridgedBill[]>;
  billWorkItems: Observable<workItem[]>;
  ProjectPlantReturns: Observable<assetInProject[]>;
  projectSections: Observable<Section[]>;
  billWorks: Observable<workItem[]>;

  constructor(public afAuth: AngularFireAuth, public router: Router, private authService: AuthService, private afs: AngularFirestore) {
    afAuth.authState.subscribe(user => {
      console.log(user);
      this.user = user;
      this.userId = user.uid;
    })

  }

  getProjectData(projectName){
    this.afs.collection('Projects', ref => { return ref.where('name', '==', projectName  ) }).snapshotChanges().pipe(
    map(b => b.map(a => {
      const data = a.payload.doc.data() as Task;
      const id = a.payload.doc.id;
      return { id, ...data };
    }))
    );
  }

  addProjectSections(projectId){}

  getProjectSections(projectId){
    this.projectSections = this.afs.collection('Projects').doc(projectId).collection<Section>('sections', ref => { return ref.orderBy('no', 'asc' ) }).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Section;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.projectSections
  }

  compParams(projectId) {
    this.currentProjectId = projectId;
    console.log(this.currentProjectId);
  }

  setCurrentProject(Ref){
    // alert(Ref.name);
    this.currentProject = Ref
  }

  getProjectPlantReturns (companyId, projectId) {
    let plantRef = this.afs.collection('Projects').doc(projectId).collection('enterprises').doc(companyId).collection<assetInProject>('plantReturns');
    // this.ProjectPlantReturns = this.afs.collection('Projects').doc(projectId).collection('enterprises').doc(companyId).collection('plantReturns').snapshotChanges().pipe(
    this.ProjectPlantReturns = plantRef.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as assetInProject;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    
    return this.ProjectPlantReturns;
  }

  getStaffProjTasks(projId, staffId) {

    console.log('project Id -->' + ' ' + projId);
    console.log('staff Id -->' + ' ' + staffId);
    let proRef = this.afs.collection('Users').doc(staffId).collection<Project>('projects').doc(projId);
    this.showStaffTasks = proRef.collection<Task>('tasks').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Task;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.showStaffTasks;
  }

  getProCompanyABOQ(projectId, compId) {
    let compRef = this.afs.collection('Projects').doc(projectId).collection('enterprises').doc(compId);
    this.Bill = compRef.collection<abridgedBill>('abridgedBOQ', ref => ref.orderBy('No', 'asc')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as abridgedBill;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.Bill;
  }

  getCompanyBillWorks(projectId, compId) {
    let compRef = this.afs.collection('Projects').doc(projectId).collection('enterprises').doc(compId);
    this.billWorks = compRef.collection<workItem>('workItems', ref => ref.orderBy('name', 'asc')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as workItem;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.billWorks;
  }

  getBillWorkItems(projectId, compId, billID) {
    let BillRef = this.afs.collection('Projects').doc(projectId).collection('enterprises').doc(compId).collection<abridgedBill>('abridgedBOQ').doc(billID);
    this.billWorkItems = BillRef.collection<workItem>('workItems').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as workItem;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.billWorkItems;
  }

  getProCompanyLabour(projectId, compId){
    let compRef = this.afs.collection('Projects').doc(projectId).collection('enterprises').doc(compId);
    this.labour = compRef.collection<ParticipantData>('labour').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ParticipantData;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.labour;
  }

  getStaffTasksActions(staffId, projId, taskId) {
    console.log('staff Id -->' + ' ' + staffId);
    console.log('project Id -->' + ' ' + projId);

    let proRef = this.afs.collection('Users').doc(staffId).collection<Project>('projects').doc(projId);    
    let taskActions = proRef.collection<Task>('tasks').doc(taskId).collection<workItem>('workItems');
    this.staffTaskActions = taskActions.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as workItem;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.staffTaskActions;
  }

  getCompanyTasks(companyId, projectId) {

    console.log('comp Id -->' + ' ' + companyId);
    console.log('project Id -->' + ' ' + projectId);

    // let dptRef = this.afs.collection<Enterprise>('Enterprises').doc(companyId).collection<Department>('departments');
    // let compRef = this.afs.collection<Enterprise>('Enterprises').doc(companyId).collection('projects').doc(projectId);
    let compRef = this.afs.collection('Projects').doc(projectId).collection<Enterprise>('enterprises').doc(companyId);
    this.companyTasks = compRef.collection<Task>('tasks').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Task;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.companyTasks;
  }

  getCompanies(projId){
    this.companies = this.afs.collection('Projects').doc(projId).collection('enterprises').snapshotChanges().pipe(
      map(b => b.map(a => {
        const data = a.payload.doc.data() as Enterprise;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.companies;
  }

  getParticipants(projId) {
    this.participants = this.afs.collection('Projects').doc(projId).collection('Participants').snapshotChanges().pipe(
      map(b => b.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.participants;
  }

  getProjects(myUserId) {
    this.projects = this.afs.collection('Users').doc(myUserId).collection<Project>('projects').snapshotChanges().pipe(
      map(b => b.map(a => {
        const data = a.payload.doc.data() as Project;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.projects;
  }

  addProject(user, project, company){
    let projectId: string = '';
    let dref = this.afs.collection('Projects')
    let entRef = this.afs.collection('Enterprises').doc(company.id).collection('projects');
    let myProRef = this.afs.collection('/Users').doc(user.id).collection('projects');
    // this.afs.collection('/Users').doc(user.id).collection('projects').add(project).then(function (pref) {
    myProRef.add(project).then(function (pref) {
      ////Add this.project to users collection of projects
      console.log(pref.id)
      projectId = pref.id;   /// Id of the newly created project

      if (project.type === 'Enterprise') {
        console.log(projectId)
        entRef.doc(projectId).set(project);
        dref.doc(projectId).set(project);
        dref.doc(projectId).update({ 'id': projectId });
        entRef.doc(projectId).update({ 'id': projectId });
        myProRef.doc(projectId).update({ 'id': projectId });
        dref.doc(projectId).collection('Participants').doc(user.id).set(user);
        dref.doc(projectId).collection('enterprises').doc(company.id).set(company);
        console.log('project Id updated');
        console.log('enterprise project');
      }
    });
  }

  dismissProject(userId, project) {
    let projectId = project.id;
    let dref = this.afs.collection('Projects')
    let entRef = this.afs.collection('Enterprises').doc(project.companyId).collection('projects');
    let myProRef = this.afs.collection('/Users').doc(userId).collection('projects');
    myProRef.doc(projectId).delete();
    if (project.type === 'Enterprise') {
      console.log(projectId)
      dref.doc(projectId).delete();
      entRef.doc(projectId).delete();
      console.log('project dismissed')
      console.log('enterprise project dismissed')
    }
  }

  getMyProjectTasks(projectId, myUserId) {
    // this.myCompanyTasks = this.afs.collection('Users').doc(myUserId).collection('tasks', ref => { return ref.where('byId', '==', myUserId) }).snapshotChanges().pipe(
    this.myProjectTasks = this.afs.collection<Enterprise>('Enterprises').doc(projectId).collection<Task>('tasks', ref => { return ref.where('byId', '==', myUserId ) }).snapshotChanges().pipe(
      map(b => b.map(a => {
        const data = a.payload.doc.data() as Task;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.myProjectTasks;
  }

  getTasksImChamp(myUserId) {
    this.tasksImChampion = this.afs.collection('Users').doc(myUserId).collection('tasks', ref => { return ref.where('champion.id', '==', myUserId) }).snapshotChanges().pipe(
      map(b => b.map(a => {
        const data = a.payload.doc.data() as Task;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.tasksImChampion;
  }

  getSelectedProject(ref) {
    console.log(ref);
    this.currentProject = ref;
    return this.currentProject;
  }
}